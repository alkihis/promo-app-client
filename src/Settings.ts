class Settings {
  protected _token: string = "";

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
}

const SETTINGS = new Settings;

export default SETTINGS;
