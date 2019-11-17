import { Student } from "./interfaces";
import APIHELPER, { APIError } from "./APIHelper";
import { throwCodeOrUndefined, notifyError } from "./helpers";

export enum LoggedLevel {
  unlogged, logged, teacher
};

class Settings {
  protected _token: string = "";
  protected _user_object: Student | null | undefined;

  public login_promise: Promise<any> = Promise.resolve();
  public login_pending = false;

  constructor() {
    // init settings
    if (localStorage.getItem('token')) {
      this.token = localStorage.getItem('token')!;
    }
    if (localStorage.getItem('user')) {
      const usr = localStorage.getItem('user')!;

      if (usr === "TEACHER") {
        this._user_object = null;
      }
      else {
        try {
          const parsed = JSON.parse(usr);
          if (validateStudent(parsed)) {
            this._user_object = parsed;
          }
          else {
            localStorage.removeItem('user');
          }
        } catch (e) {
          localStorage.removeItem('user');
        }
      }

      if (this._user_object !== undefined) {
        // Lance la validation de l'utilisateur
        setTimeout(() => {
          this.validateUser();
        }, 5);
      }
    }
  }
  
  get token() {
    if (this._user_object === undefined)
      // Non connecté !
      return "";
    return this._token;
  }

  set token(v: string) {
    this._token = v;
    localStorage.setItem('token', v);
  }

  get logged() {
    if (this.token && !this.login_pending) {
      if (this._user_object === null) {
        return LoggedLevel.teacher;
      }
      return LoggedLevel.logged;
    }
    return LoggedLevel.unlogged;
  }

  get logged_student() {
    if (this._user_object !== null) {
      return this._user_object;
    }
    return undefined;
  }

  unlog() {
    this._token = "";
    this._user_object = undefined;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Student + token: Register student
   * 
   * true + token: Register teacher
   * 
   * false: Unlog
   * 
   * @param student 
   * @param token 
   */
  registerUser(student: Student | boolean, token?: string) {
    if (typeof student === 'boolean') {
      if (student) {
        // true: teacher
        localStorage.setItem('user', "TEACHER");
        this.token = token!;
      }
      else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    else {
      localStorage.setItem('user', JSON.stringify(student));
      this.token = token!;
    }
  }

  async loginAs(key_or_password: string, teacher: boolean) {
    if (this.login_pending) {
      return this.login_promise;
    }

    this.login_pending = true;
    return (
      this.login_promise = this.doLogin(key_or_password, teacher)
    ).finally(() => {
      this.login_pending = false;
    });
  }

  protected async doLogin(key_or_password: string, teacher: boolean) {  
    if (teacher) {
      const teacher_prom = APIHELPER.request('auth/login', {
        parameters: {
          password: key_or_password
        },
        method: 'POST',
        auth: false
      });

      try {
        const token: { token: string } = await teacher_prom;
        // Teacher is logged !
        this.registerUser(true, token.token);
      } catch (e) {
        throwCodeOrUndefined(e);
      }
    }
    else {
      const test_token = APIHELPER.request('auth/validate', {
        parameters: {
          token: key_or_password
        },
        method: 'POST',
        auth: false
      });
  
      try {
        await test_token;
      } catch (e) {
        throwCodeOrUndefined(e);
      }
  
      // Try to get user object
      const student = APIHELPER.request('student/self', {
        auth: key_or_password
      });
  
      try {
        const s: Student = await student;
  
        // Register student in settings
        this.registerUser(s, key_or_password);
      } catch (e) {
        throwCodeOrUndefined(e);
      }
    }
  }

  validateUser() {
    if (this.login_pending) {
      return this.login_pending;
    }

    this.login_pending = true;
    return (
      this.login_promise = this.checkValidity()
    ).finally(() => { this.login_pending = false; });
  }

  protected async checkValidity() {
    const test_token = APIHELPER.request('auth/validate', {
      parameters: {
        token: this._token
      },
      method: 'POST',
      auth: false
    }).then(async (s: { is_teacher: boolean }) => {
      if (s.is_teacher) {
        return s;
      }
      
      // Doit télécharger l'étudiant en cours
      return APIHELPER.request('student/self', { auth: this.token })
        .then((stu: Student) => {
          return { ...s, student: stu };
        });
    });

    try {
      const status: { is_teacher: boolean, student?: Student } = await test_token;

      if (this._user_object === null && status.is_teacher) {
        // validé (teacher)
        this.registerUser(true, this.token);
      }
      else if (this._user_object && !status.is_teacher && status.student) {
        // validé aussi (student)
        this.registerUser(status.student, this.token);
      }
      else {
        // pas valide
        this.unlog();
      }
    } catch (e) {
      if (Array.isArray(e) && APIHELPER.isApiError(e[1])) {
        notifyError(e as [any, APIError]);

        if (e[1].code === 6) {
          // Invalid credentials
          this.unlog();
        }
      }

      throwCodeOrUndefined(e);
    }
  }
}

function validateStudent(e: any) : e is Student {
  return !!(
    typeof e === 'object' &&
    typeof e.id === 'number' &&
    typeof e.last_name === 'string' &&
    typeof e.first_name === 'string' &&
    typeof e.year_in === 'string' &&
    (e.entered_in === 'M1' || e.entered_in === 'M2') &&
    typeof e.email === 'string'
  );
}

const SETTINGS = new Settings();

export default SETTINGS;

declare global {
  interface Window {
    DEBUG: any;
  }
} 

window.DEBUG = { settings: SETTINGS };
