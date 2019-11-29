import React from 'react';
import classes from './AskCreation.module.scss';
import { Typography, TextField, Button, CircularProgress } from '@material-ui/core';
import APIHELPER from '../../../../APIHelper';
import { toast } from '../../../shared/Toaster/Toaster';
import { notifyError } from '../../../../helpers';
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

    try {
      for (const email of this.state.email.split(',')) {
        await APIHELPER.request('ask_creation/create', {
          method: 'POST',
          parameters: {
            mail: email.trim(),
          }
        });
      }

      if (this.state.email.split(',').length > 1) {
        toast("Les demandes de création de compte ont été envoyées.", "success");
      }
      else {
        toast("La demande de création de compte a été envoyée.", "success");
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
    const available_years: number[] = [];
    for (let cur_year = (new Date()).getFullYear(); cur_year >= 2015; cur_year--) {
      available_years.push(cur_year);
    }

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
            helperText="En cas d'envoi multiples, séparez les adresses par des virgules."
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