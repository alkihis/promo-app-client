import APIHELPER, { APIError } from "./APIHelper";
import React from 'react';
import { Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Divider } from "@material-ui/core";
import { toast } from "./components/shared/Toaster/Toaster";

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

export const ClassicModal: React.FC<{ 
  open?: boolean, 
  text: string,
  explaination: string,
  validateText: string,
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

