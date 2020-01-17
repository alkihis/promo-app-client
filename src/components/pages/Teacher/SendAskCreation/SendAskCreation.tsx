import React from 'react';
import classes from '../../AskCreation/AskCreation.module.scss';
import { Typography, TextField, Button, CircularProgress } from '@material-ui/core';
import APIHELPER from '../../../../utils/APIHelper';
import { toast } from '../../../shared/Toaster/Toaster';
import { notifyError } from '../../../../utils/helpers';
import { RouteComponentProps } from 'react-router-dom';
import { DashboardContainer } from '../../../shared/Dashboard/Dashboard';

type SACState = {
  email: string;
  in_load: boolean;
};

export default class SendAskCreationStudent extends React.Component<RouteComponentProps, SACState> {
  state: SACState = {
    email: "",
    in_load: false,
  };

  create = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();
    this.setState({
      in_load: true
    });

    let failed = 0;
    let done = 0;
    try {
      for (const email of this.state.email.split(',')) {
        try {
          await APIHELPER.request('ask_creation/create', {
            method: 'POST',
            parameters: {
              mail: email.trim(),
            }
          });
          done++;
        } catch (e) {
          if (Array.isArray(e) && APIHELPER.isApiError(e[1])) {
            if (e[1].code === 11) {
              // CONFLICT
              failed++;
            }
            else {
              // Autre erreur, inattendue
              throw e;
            }
          }
        }
      }

      if (!failed) {
        if (done > 1) {
          toast("Les demandes de création de compte ont été envoyées.", "success");
        }
        else {
          toast("La demande de création de compte a été envoyée.", "success");
        }
      }
      else {
        if (done > 1) {
          toast(String(done) + " demandes de création de compte ont été envoyées.", "success");
        }
        else if (done) {
          toast("Une demande de création de compte a été envoyée.", "success");
        }
        
        if (failed > 1) {
          toast(String(failed) + " e-mails n'ont pas été envoyés : les adresses e-mail existent déjà en base de données.", "info");
        }
        else {
          toast("Un e-mail n'a pas été envoyé : l'adresse e-mail existe déjà en base de données.", "error");
        }
      }

      this.setState({
        email: ""
      });
    } catch (e) {
      notifyError(e);
    }

    this.setState({
      in_load: false
    });
  };

  emailChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: evt.currentTarget.value
    });
  };

  render() {
    return (
      <DashboardContainer>
        <Typography variant="h4" gutterBottom>
          Demande de création de compte
        </Typography>

        <Typography color="textSecondary" gutterBottom>
          Si vous souhaitez que les étudiants crééent eux-mêmes leur profil de A à Z, spécifiez ici
          les adresses e-mail sur lesquelles ils sont contactables.
          Un identifiant unique permettant de configurer leur compte sera généré, et leur sera envoyé.
        </Typography>

        <form className={classes.form} onSubmit={this.create}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            required
            label="Adresse(s) e-mail"
            helperText="En cas d'envois multiples, séparez les adresses par des virgules."
            type="text"
            multiline
            autoComplete="off"
            disabled={this.state.in_load}
            onChange={this.emailChange}
            value={this.state.email}
          />

          <div className={classes.wrapper}>
            <Button
              type="submit"
              variant="outlined"
              color="primary"
              disabled={this.state.in_load}
              className={classes.submit}
            >
              Envoyer demande(s)
              {this.state.in_load && <CircularProgress size={26} className={classes.buttonProgress} />}
            </Button>
          </div>
        </form>
      </DashboardContainer>
    );
  }
}
