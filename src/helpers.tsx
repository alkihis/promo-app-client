import APIHELPER, { APIError } from "./APIHelper";
import React from 'react';
import { Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Divider } from "@material-ui/core";
import { toast } from "./components/shared/Toaster/Toaster";
import { Student } from "./interfaces";
import SETTINGS, { LoggedLevel } from "./Settings";

export function setPageTitle(title?: string, absolute = false) {
  if (!absolute)
    document.title = "Archive Explorer" + (title ? ` - ${title}` : '');
  else
    document.title = title!;
}

export function rejectCodeOrUndefined(e: any) {
  if (Array.isArray(e) && APIHELPER.isApiError(e[1])) {
    return Promise.reject(e[1].code);
  }
  return Promise.reject();
}

export function throwCodeOrUndefined(e: any) {
  if (Array.isArray(e) && APIHELPER.isApiError(e[1])) {
    throw e[1].code;
  }
  throw undefined;
}

export const CenterComponent = (props: any) => {
  return (
    <Grid container direction="column" justify="center" {...props} alignItems="center">
      {props.children}
    </Grid>
  );
};

export const BigPreloader: React.FC<any> = (props: any) => {
  return (
    <CenterComponent {...props}>
      <CircularProgress size={70} thickness={2} />
    </CenterComponent>
  );
};

export function notifyError(error: APIError | [any, APIError | undefined] | undefined) : void {
  if (Array.isArray(error)) {
    return notifyError(error[1]);
  }

  console.error(error);
  toast(errorToText(error), "error");
}

export function studentDashboardLink(student: Student) {
  if (SETTINGS.logged === LoggedLevel.teacher) {
    return "/teacher/dashboard/" + String(student.id) + "/"
  }
  return "/student/";
}

export function uppercaseFirst(str: string) {
  if (str.length === 0) {
    return str;
  }

  return str[0].toLocaleUpperCase() + str.slice(1);
}

export function errorToText(error: APIError | number | undefined | [any, APIError]) : string {
  if (!error) {
    return "Erreur réseau. Réessayez ultérieurement.";
  }

  if (Array.isArray(error)) {
    return errorToText(error[1]);
  }

  if (typeof error !== 'number') {
    return errorToText(error.code);
  }

  switch (error) {
    case 1:
      return "Le service demandé n'a pas été trouvé. Le serveur est peut être mal configuré.";
    case 2:
      return "La ressource demandée est introuvable.";
    case 3:
      return "Impossible d'effectuer la requête. Cette erreur ne devrait pas arriver !";
    case 4:
      return "Erreur interne du serveur. Réessayez ultérieurement.";
    case 5:
      return "Le mot de passe est incorrect.";
    case 6:
      return "Le clé d'accès est invalide.";
    case 7:
      return "Le format des paramètres de la requête est invalide.";
    case 8:
      return "Vous n'avez pas d'autorisation de faire cela.";
    case 9:
      return "Vous devez être connecté pour faire cela.";
    case 10:
      return "Des paramètres nécessaires à la requête ne sont pas présents.";
    case 11:
      return "Cet élément existe déjà.";
    default:
      return "Erreur inconnue.";
  }
}

export function getMonthText(month: string | number) {
  const m = Number(month);

  switch (m) {
    case 1:
      return "Janvier";
    case 2:
      return "Février";
    case 3:
      return "Mars";
    case 4:
      return "Avril";
    case 5:
      return "Mai";
    case 6:
      return "Juin";
    case 7:
      return "Juillet";
    case 8:
      return "Août";
    case 9:
      return "Septembre";
    case 10:
      return "Octobre";
    case 11:
      return "Novembre";
    case 12:
      return "Décembre";
  }
}

/**
 * Formate un objet Date en chaîne de caractères potable.
 * Pour comprendre les significations des lettres du schéma, se référer à : http://php.net/manual/fr/function.date.php
 * @param schema string Schéma de la chaîne. 
 * Supporte Y, m, d, g, H, i, s, n, N, v, z, w, F (français, first-uppercase), M (français)
 * @param date Date Date depuis laquelle effectuer le formatage
 * @returns string La chaîne formatée
 */
export function dateFormatter(schema: string, date = new Date()) : string {
  function getDayOfTheYear(now: Date): number {
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);

    return day - 1; // Retourne de 0 à 364/365
  }

  const Y = date.getFullYear();
  const N = date.getDay() === 0 ? 7 : date.getDay();
  const n = date.getMonth() + 1;
  const m = (n < 10 ? "0" : "") + String(n);
  const M = (d: Date) => getMonthText(d.getMonth() + 1)?.toLocaleLowerCase();
  const F = (d: Date) => getMonthText(d.getMonth() + 1);
  const d = ((date.getDate()) < 10 ? "0" : "") + String(date.getDate());
  const L = Y % 4 === 0 ? 1 : 0;

  const i = ((date.getMinutes()) < 10 ? "0" : "") + String(date.getMinutes());
  const H = ((date.getHours()) < 10 ? "0" : "") + String(date.getHours());
  const g = date.getHours();
  const s = ((date.getSeconds()) < 10 ? "0" : "") + String(date.getSeconds());

  const replacements: any = {
    Y, m, F, M, d, i, H, g, s, n, N, L, v: date.getMilliseconds(), z: getDayOfTheYear, w: date.getDay()
  };

  let str = "";

  // Construit la chaîne de caractères
  for (const char of schema) {
    if (char in replacements) {
      if (typeof replacements[char] === 'string') {
        str += replacements[char];
      }
      else if (typeof replacements[char] === 'number') {
        str += String(replacements[char]);
      }
      else {
        str += String(replacements[char](date));
      }
    }
    else {
      str += char;
    }
  }

  return str;
}

export const ClassicModal: React.FC<{ 
  open?: boolean, 
  text: string,
  explaination: string,
  validateText?: string,
  onClose?: () => void,
  onValidate?: () => void,
  onCancel?: () => void
}> = props => {
  return (
    <Dialog
      open={props.open!}
      onClose={props.onClose}
    >
      <DialogTitle>{props.text}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {props.explaination}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel} color="primary" autoFocus>
          Annuler
        </Button>
        <Button onClick={props.onValidate} color="secondary">
          {props.validateText ? props.validateText : "Confirmer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export function DividerMargin(props: { size: number | string }) {
  return <Divider style={{ marginTop: props.size, marginBottom: props.size }} />;
}

export function Marger(props: { size: number | string }) {
  return <div style={{ marginTop: props.size, marginBottom: props.size, width: '100%', height: '1px' }} />;
}

