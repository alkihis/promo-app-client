import SETTINGS from "./Settings";
import { BASE_API_URL } from "./constants";

export class APIHelper {

  /**
   * Send a request to API.
   * If successful, Promise contains response content, parsed if JSON.
   * 
   * If request fails (JSON parse error, API error), return a **tuple** with 2 elements of type
   * `[Response, any]`: First element is a Response object, second one is the error.
   * If error is an object with a .code attribute and a .error attribute, 
   * this is a APIError, not a JSON parse error.
   * 
   * You can check this with a `APIHELPER.isApiError(error): error is APIError`.
   * 
   * You can force the return of the response, even if the request is successful, 
   * by including `{ full: true }` in the `settings` object.
   */
  request(
    url: string,
    settings: {
      parameters?: { [key: string]: any },
      method?: "GET" | "POST",
      mode?: 'json' | 'text',
      headers?: { [key: string]: string } | Headers,
      body_mode?: 'form-encoded' | 'multipart' | 'json',
      auth?: boolean,
      full?: boolean
    } = { 
      method: 'GET',
      parameters: {}, 
      mode: 'json',
      body_mode: 'form-encoded',
      auth: true
    }
  ): Promise<any> {
    let fullurl = BASE_API_URL + url + (url.endsWith('.json') ? "" : ".json");

    if (!settings.parameters) {
      settings.parameters = {};
    }
    if (!settings.method) {
      settings.method = "GET";
    }

    // Build parameters
    var fd: FormData | string | undefined = undefined;

    if (Object.keys(settings.parameters).length) {
      // Encodage dans la query
      if (settings.method === "GET") {
        let str = "?";
        for (const [key, value] of Object.entries(settings.parameters)) {
          str += key + "=" + value;
        }
        fullurl += str;
      }
      // Encodage POST (dans le body)
      else {
        // Si multipart (formdata)
        if (settings.body_mode && settings.body_mode === "multipart") {
          fd = new FormData();
  
          for (const [key, value] of Object.entries(settings.parameters)) {
            fd.append(key, value);
          }
        }
        // Si www-form-encoded (ou par défault)
        else if (!settings.body_mode || settings.body_mode === "form-encoded") {
          const buffer: string[] = [];

          for (const [key, value] of Object.entries(settings.parameters)) {
            buffer.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
          }

          fd = buffer.join('&');

          if (settings.headers) {
            if (settings.headers instanceof Headers)
              settings.headers.append('Content-Type', 'application/x-www-form-urlencoded');
            else
              settings.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          }
          else {
            settings.headers = {
              'Content-Type': 'application/x-www-form-urlencoded'
            };
          }
        }
        // Sinon (json)
        else {
          fd = JSON.stringify(settings.parameters);

          if (settings.headers) {
            if (settings.headers instanceof Headers)
              settings.headers.append('Content-Type', 'application/json');
            else
              settings.headers['Content-Type'] = 'application/json';
          }
          else {
            settings.headers = {
              'Content-Type': 'application/json'
            };
          }
        }
      }
    }

    if (settings.auth !== false) {
      if (!SETTINGS.token) {
        console.warn("Could not authentificate request without token. Skipping auth header...");
      }
      else {
        if (settings.headers) {
          if (settings.headers instanceof Headers) 
            settings.headers.set('Authorization', "Bearer " + SETTINGS.token);
          else
            settings.headers['Authorization'] = "Bearer " + SETTINGS.token;
        }
        else {
          settings.headers = {
            Authorization: "Bearer " + SETTINGS.token
          };
        }
      }
    }

    return fetch(fullurl, {
      method: settings.method ? settings.method : "GET",
      body: (fd ? fd : undefined),
      headers: settings.headers
    })
      .then(rspe => {
        if (!settings.mode || settings.mode === "json") {
          if (rspe.headers.get('Content-Length') === "0") {
            return {};
          }

          var api_result: Promise<any>;
          if (rspe.ok) {
            api_result = rspe.json();
          }
          else {
            api_result = rspe.json()
              .catch(e => [rspe, e])
              .then(content => {
                if (Array.isArray(content)) {
                  // on a catché une erreur avec le JSON (content est un tableau)
                  // L'API ne renvoie jamais de tableau si ça a échoué
                  // On extrait l'erreur
                  [, content] = content;
                }
                // Sinon, erreur mais contenu API lisible, on renvoie le JSON parsé (dans content)
                
                // Renvoie quoiqu'il arrive une promise rejetée avec contenu et requête
                return Promise.reject([rspe, content]);
              })
          }

          // Inclut la requête avec le contenu
          if (settings.full) {
            return api_result.then(e => [rspe, e]);
          }
          
          return api_result;
        }
        else {
          return rspe.ok ? rspe.text().then(e => settings.full ? [rspe, e] : e) : rspe.text().then(d => Promise.reject([rspe, d]));
        }
      });
  }

  isApiError(data: any) : data is APIError {
    return !!(data && typeof data.code === 'number' && typeof data.error === 'string');
  }
}

export interface APIError {
  error: string;
  code: number;
  detail?: any;
}

const APIHELPER = new APIHelper();

export default APIHELPER;
