class Settings {
  protected _token: string = "";

  public test: any = {};
  public logged = false;

  constructor() {
    // init settings
    if (localStorage.token) {
      this.token = localStorage.token;
    }
  }
  
  get token() {
    return this._token;
  }

  set token(v: string) {
    this._token = v;
    localStorage.token = v;
  }

  testlogin() {
    this.logged = true;
    this.test.baba = function() { return "Coucou" };
  }

  testlogout() {
    this.logged = false;
    this.test = {};
  }
}

const SETTINGS = new Settings;

export default SETTINGS;

declare global {
  interface Window {
    DEBUG: any;
  }
} 

window.DEBUG = { settings: SETTINGS };
