import React from 'react';
import classes from './AskCreation.module.scss';
import { Typography, TextField, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Container } from '@material-ui/core';
import APIHELPER from '../../../../APIHelper';
import { Student } from '../../../../interfaces';
import { toast } from '../../../shared/Toaster/Toaster';
import { notifyError } from '../../../../helpers';
import { RouteComponentProps } from 'react-router-dom';
import QueryString from 'query-string';
import { FullError } from '../../../shared/EmbeddedError/EmbeddedError';

type ACState = {
  surname: string;
  name: string;
  email: string;
  is_m1: boolean;
  year_in: string;
  in_load: boolean;
  graduated: boolean;
  token?: string;
  created: boolean;
};

export default class AskCreationStudent extends React.Component<RouteComponentProps, ACState> {
  state: ACState = {
    surname: "",
    name: "",
    email: "",
    is_m1: true,
    year_in: "2017",
    in_load: false,
    graduated: true,
    created: false,
  };

  constructor(props: RouteComponentProps) {
    super(props);
    const query_string = props.location.search;

    if (query_string) {
      const parsed = QueryString.parse(query_string);
      
      if (parsed.token) {
        this.state.token = parsed.token as string;
      }
    }
  }

  create = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();
    this.setState({
      in_load: true
    });

    try {
      const student: Student = await APIHELPER.request('ask_creation/new', {
        method: 'POST',
        parameters: {
          last_name: this.state.name,
          first_name: this.state.surname,
          email: this.state.email,
          year_in: this.state.year_in,
          graduated: this.state.graduated,
          entered_in: this.state.is_m1 ? "M1" : "M2",
          token: this.state.token
        }
      });

      console.log("Created:", student);
      toast("Votre profil a été créé avec succès.", "success");

      this.setState({
        created: true,
        in_load: false,
      });
    } catch (e) {
      notifyError(e);

      this.setState({
        in_load: false
      });
    }
  };

  surnameChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      surname: evt.currentTarget.value
    });
  };
  nameChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      name: evt.currentTarget.value
    });
  };
  emailChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: evt.currentTarget.value
    });
  };
  yearInChange = (evt: React.ChangeEvent<{ name?: string; value: unknown; }>) => {
    this.setState({
      year_in: evt.target.value as string
    });
  };
  isM1Change = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      is_m1: evt.currentTarget.checked
    });
  };
  isGraduated = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      graduated: evt.currentTarget.checked
    });
  };

  renderNoToken() {
    return <FullError 
      title="Requête invalide"
      text="Impossible d'afficher cette page. Vérifiez le lien fourni." 
    />;
  }

  render() {
    if (!this.state.token) {
      return this.renderNoToken();
    }

    const available_years: number[] = [];
    for (let cur_year = (new Date()).getFullYear(); cur_year >= 2015; cur_year--) {
      available_years.push(cur_year);
    }

    return (
      <Container style={{ marginTop: '2rem' }}>
        <Typography variant="h4">
          Nouveau profil étudiant
        </Typography>

        {!this.state.created && <form className={classes.form} onSubmit={this.create}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            required
            label="Nom"
            disabled={this.state.in_load}
            type="text"
            onChange={this.nameChange}
            value={this.state.name}
            autoFocus
          />

          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            required
            label="Prénom"
            type="text"
            disabled={this.state.in_load}
            onChange={this.surnameChange}
            value={this.state.surname}
          />

          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            required
            label="Adresse e-mail"
            type="email"
            autoComplete="off"
            disabled={this.state.in_load}
            onChange={this.emailChange}
            value={this.state.email}
          />

          <FormControl className={classes.formControl}>
            <InputLabel id="year_in_label">Année d'entrée dans le master</InputLabel>
            <Select
              labelId="year_in_label"
              value={this.state.year_in}
              className={classes.select}
              required
              disabled={this.state.in_load}
              onChange={this.yearInChange}
            >
              {available_years.map(e => (
                <MenuItem value={String(e)} key={e}>{e}</MenuItem>
              ))}
            </Select>
          </FormControl> 
          
          <FormControlLabel
            control={<Checkbox 
              value="entered_m1" 
              disabled={this.state.in_load} 
              color="primary" 
              onChange={this.isM1Change} 
              checked={this.state.is_m1}
            />}
            label="Je suis entré•e dans le master en M1"
          />

          <FormControlLabel
            control={<Checkbox 
              value="graduated" 
              disabled={this.state.in_load} 
              color="primary" 
              onChange={this.isGraduated} 
              checked={this.state.graduated}
            />}
            label="Diplômé"
          />

          <div className={classes.wrapper}>
            <Button
              type="submit"
              variant="outlined"
              color="primary"
              disabled={this.state.in_load}
              className={classes.submit}
            >
              Créer mon profil
              {this.state.in_load && <CircularProgress size={26} className={classes.buttonProgress} />}
            </Button>
          </div>
        </form>}

        {this.state.created && <div className={classes.form}>
          <Typography variant="h5" color="textPrimary" gutterBottom>
            Votre profil a été créé avec succès.
          </Typography>

          <Typography color="textSecondary" gutterBottom>
            Un e-mail vous a été envoyé.
            Il contient un lien permettant de vous connecter au service.
          </Typography>
        </div>}
      </Container>
    );
  }
}