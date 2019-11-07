import React from 'react';
import classes from './AddStudent.module.scss';
import { DashboardContainer } from '../../shared/Dashboard/Dashboard';
import { Typography, TextField, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress } from '@material-ui/core';
import APIHELPER from '../../../APIHelper';
import { Student } from '../../../interfaces';
import { toast } from '../../shared/Toaster/Toaster';
import { notifyError } from '../../../helpers';

type ASState = {
  surname: string;
  name: string;
  email: string;
  is_m1: boolean;
  year_in: string;
  in_load: boolean;
  graduated: boolean;
};

export default class AddStudent extends React.Component<{}, ASState> {
  state = {
    surname: "",
    name: "",
    email: "",
    is_m1: true,
    year_in: "2017",
    in_load: false,
    graduated: true,
  };

  resetState = () => {
    this.setState({
      surname: "",
      name: "",
      email: "",
      is_m1: true,
      year_in: "2017",
      in_load: false,
      graduated: true,
    });
  };

  create = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();
    this.setState({
      in_load: true
    });

    try {
      const student: Student = await APIHELPER.request('student/create', {
        method: 'POST',
        parameters: {
          last_name: this.state.name,
          first_name: this.state.surname,
          email: this.state.email,
          year_in: this.state.year_in,
          graduated: this.state.graduated,
          entered_in: this.state.is_m1 ? "M1" : "M2"
        }
      });

      console.log("Created:", student);
      toast("L'étudiant a été crée avec succès.", "success");
      
      this.resetState();
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

  render() {
    const available_years: number[] = [];
    for (let cur_year = (new Date).getFullYear(); cur_year >= 2015; cur_year--) {
      available_years.push(cur_year);
    }

    return (
      <DashboardContainer>
        <Typography variant="h4">
          Nouvel étudiant
        </Typography>

        <form className={classes.form} onSubmit={this.create}>
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
            label="Cet étudiant•e est entré•e dans le master en M1"
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
              Créer étudiant
              {this.state.in_load && <CircularProgress size={26} className={classes.buttonProgress} />}
            </Button>
          </div>
        </form>
      </DashboardContainer>
    );
  }
}