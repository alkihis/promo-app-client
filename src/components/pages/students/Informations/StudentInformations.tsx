import React from 'react';
import { Student, Formation } from '../../../../interfaces';
import StudentContext from '../../../shared/StudentContext/StudentContext';
import { RouteComponentProps } from 'react-router-dom';
import { DashboardContainer } from '../../../shared/Dashboard/Dashboard';
import { Marger, errorToText, ClassicModal } from '../../../../helpers';
import { Button, Typography, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, Input, InputAdornment } from '@material-ui/core';
import classes from '../StudentJob/Forms.module.scss';
import { toast } from '../../../shared/Toaster/Toaster';
import FormationModal, { FormationResume } from './FormationModal';
import APIHELPER from '../../../../APIHelper';

type SIState = {
  modal_formation_before: boolean;
  modal_formation_after: boolean;

  modal_delete_previous: boolean;
  modal_delete_next: boolean;

  last_name: string;
  first_name: string;
  email: string;

  year_in: string;
  year_out?: string;

  entered_in_m1: boolean;
  graduated: boolean;

  public: boolean;

  previous_formation?: Formation | null;
  next_formation?: Formation | null;

  in_send: boolean;
};

export default class StudentInformations extends React.Component<RouteComponentProps, SIState> {
  static contextType = StudentContext;
  context!: Student;

  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      in_send: false,
      modal_formation_before: false,
      modal_formation_after: false,
      last_name: "",
      first_name: "",
      email: "",
      graduated: false,
      entered_in_m1: false,
      modal_delete_previous: false,
      modal_delete_next: false,
      year_in: "2019",
      public: false,
    };
  }

  componentDidMount() {
    const etu = this.context;

    this.setState({
      last_name: etu.last_name,
      first_name: etu.first_name,
      graduated: etu.graduated,
      entered_in_m1: etu.entered_in === "M1",
      year_in: etu.year_in,
      year_out: etu.year_out,
      email: etu.email,
      previous_formation: etu.previous_formation,
      next_formation: etu.next_formation,
      public: etu.public,
    });
  }

  handleEnteredM1Change = (_: any, checked: boolean) => {
    this.setState({
      entered_in_m1: checked
    });
  };

  handleGraduatedChange = (_: any, checked: boolean) => {
    this.setState({
      graduated: checked
    });
  };

  handlePublicChange = (_: any, checked: boolean) => {
    this.setState({
      public: checked
    });
  };

  handleYearInChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    const current_year = (new Date()).getFullYear();
    if (Number(evt.target.value) === current_year) {
      this.setState({
        year_out: undefined,
        graduated: false
      });
    }
    else {
      const actual_year_out = this.state.year_out;
      if (actual_year_out) {
        const year_out = Number(actual_year_out);
        const year_in = Number(evt.target.value);
  
        if (year_in + 1 > year_out) {
          this.setState({
            year_out: String(year_in + 1)
          });
        } 
      }
    }

    this.setState({
      year_in: evt.target.value as string
    });
  };

  handleYearOutChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      year_out: evt.target.value !== 'Aucune' ? evt.target.value as string : undefined
    });
  };

  handleLastNameChange = (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = evt.target.value;
    this.setState({
      last_name: v
    });
  };

  handleFirstNameChange = (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = evt.target.value;
    this.setState({
      first_name: v
    });
  };

  handleMailChange = (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = evt.target.value;
    this.setState({
      email: v
    });
  };

  submitForm = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.state.graduated && !this.state.year_out) {
      toast("Veuillez spécifier votre année de sortie du master.", "warning");
      return;
    }

    this.setState({
      in_send: true
    });

    const context = this;

    async function sendFormation(formation: Formation) {
      return APIHELPER.request('formation/create', { 
        parameters: { 
          user_id: context.context.id,
          name: formation.branch,
          location: formation.location,
          level: formation.level,
        },
        method: 'POST'
      });
    }

    // La formation précédente doit être insérée
    let previous_formation = this.state.previous_formation;
    if (this.state.previous_formation?.id === 0) {
      try {
        previous_formation = await sendFormation(this.state.previous_formation);
        this.setState({
          previous_formation
        });
      } catch (e) {
        toast("Impossible d'ajouter la formation précédente dans la base de données: " + errorToText(e), "error");
        this.setState({
          in_send: false
        });
        return;
      }
    }

    // La formation suivante doit être insérée
    let next_formation = this.state.next_formation;
    if (this.state.next_formation?.id === 0) {
      try {
        next_formation = await sendFormation(this.state.next_formation);
        this.setState({
          next_formation
        });
      } catch (e) {
        toast("Impossible d'ajouter la formation suivante dans la base de données: " + errorToText(e), "error");
        this.setState({
          in_send: false
        });
        return;
      }
    }

    // Sauve les modifs
    try {
      const stu: Student = await APIHELPER.request('student/modify', {
        method: 'POST',
        parameters: {
          first_name: this.state.first_name,
          last_name: this.state.last_name,
          entered_in: this.state.entered_in_m1 ? "M1" : "M2",
          year_in: this.state.year_in,
          year_out: this.state.year_out ?? null,
          email: this.state.email,
          previous_formation: this.state.previous_formation?.id ?? null,
          next_formation: this.state.next_formation?.id ?? null,
          graduated: this.state.graduated,
          user_id: this.context.id,
          public: this.state.public,
        }
      });

      console.log("Modified", stu);
      toast("Vos informations ont été modifiées avec succès.", "success");

      // Met à jour le state...
      this.setState({
        first_name: stu.first_name,
        last_name: stu.last_name,
        entered_in_m1: stu.entered_in === "M1",
        year_in: stu.year_in,
        year_out: stu.year_out,
        email: stu.email,
        previous_formation: stu.previous_formation,
        next_formation: stu.next_formation,
        graduated: stu.graduated,
        in_send: false
      });

      // Et le contexte (objet en lecture seule, modification des props) !
      this.context.first_name = stu.first_name;
      this.context.last_name = stu.last_name;
      this.context.entered_in = stu.entered_in;
      this.context.year_in = stu.year_in;
      this.context.year_out = stu.year_out;
      this.context.email = stu.email;
      this.context.previous_formation = stu.previous_formation;
      this.context.graduated = stu.graduated;
      this.context.next_formation = stu.next_formation;
      this.context.public = stu.public;
    } catch (e) {
      toast("Impossible de modifier vos informations: " + errorToText(e), "error");
      this.setState({
        in_send: false
      });
    }
  };

  handleAnyModalClose = () => {
    this.setState({
      modal_delete_next: false,
      modal_delete_previous: false
    });
  };

  handlePreviousModalOpen = () => {
    this.setState({
      modal_delete_previous: true
    });
  };

  handleNextModalOpen = () => {
    this.setState({
      modal_delete_next: true
    });
  };

  render() {
    // TODO get available start & end year for this student
    const available_start_years: number[] = [];
    const current_year = (new Date()).getFullYear();
    for (let i = current_year; i >= 2015; i--) {
      available_start_years.push(i);
    }
    const available_end_years: number[] = [];
    for (let i = current_year; i >= Number(this.state.year_in) + 1; i--) {
      available_end_years.push(i);
    }

    const cant_be_graduated = Number(this.state.year_in) === current_year || !this.state.year_out;

    return (
      <DashboardContainer maxWidth="md">
        <ClassicModal 
          text="Supprimer la formation précédente ?"
          explaination="Celle-ci sera détachée de votre profil."
          onClose={this.handleAnyModalClose}
          onCancel={this.handleAnyModalClose}
          open={this.state.modal_delete_previous}
          onValidate={() => this.setState({ modal_delete_previous: false, previous_formation: undefined })}
        />

        <ClassicModal 
          text="Supprimer la formation suivante ?"
          explaination="Celle-ci sera détachée de votre profil."
          onClose={this.handleAnyModalClose}
          onCancel={this.handleAnyModalClose}
          open={this.state.modal_delete_next}
          onValidate={() => this.setState({ modal_delete_next: false, next_formation: undefined })}
        />

        <div className={classes.container + " " + classes.dialog + " " + (this.state.in_send ? classes.in_load : "")}>
          {/* Formation précédente */}
          <Typography variant="h5" gutterBottom>
            Formation précédente
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Indiquez ici quelle formation vous avez effectué avant votre entrée en master.
          </Typography>

          <FormationModal
            base={this.state.previous_formation ?? undefined}
            open={this.state.modal_formation_before}
            onClose={() => this.setState({ modal_formation_before: false })}
            onConfirm={f => this.setState({ previous_formation: f, modal_formation_before: false })}
          />
          <FormationResume 
            onLinkClick={() => this.setState({ modal_formation_before: true })}
            formation={this.state.previous_formation ?? undefined} 
            onDeleteClick={() => this.setState({ modal_delete_previous: true })}
          />

          <Marger size="1rem" />

          {/* Formation suivante */}
          <Typography variant="h5" gutterBottom>
            Formation suivante / Réorientation
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Si vous avez réalisé une thèse après votre master, merci de l'indiquer dans la section Emplois.
          </Typography>
          <FormationModal
            base={this.state.next_formation ?? undefined}
            open={this.state.modal_formation_after}
            onClose={() => this.setState({ modal_formation_after: false })}
            onConfirm={f => this.setState({ next_formation: f, modal_formation_after: false })}
          />
          <FormationResume 
            onLinkClick={() => this.setState({ modal_formation_after: true })}
            formation={this.state.next_formation ?? undefined} 
            onDeleteClick={() => this.setState({ modal_delete_next: true })}
          />

          <Marger size="1rem" />

          {/* Autres informations */}
          <form onSubmit={this.submitForm}>
            <Typography variant="h5">
              À propos de vous
            </Typography>

            <Typography variant="body2" gutterBottom>
              En autorisant l'affichage de votre adresse e-mail aux autres étudiants,
              celle-ci sera présente dans la liste de contacts étudiants de la carte des emplois,
              visible sur la page d'accueil. 
            </Typography>

            <Marger size=".5rem" />

            {/* E-mail */}
            <div className={classes.grid_two_column + " " + classes.gap}>
              <FormControl>
                <InputLabel htmlFor="email-input">Adresse e-mail</InputLabel>
                <Input
                  type="email" 
                  id="email-input" 
                  required
                  startAdornment={<InputAdornment position="start">@</InputAdornment>}
                  value={this.state.email ?? ""}
                  onChange={this.handleMailChange}
                />
              </FormControl>

              <FormControlLabel
                className={classes.flex_center}
                control={<Checkbox 
                  checked={this.state.public} 
                  onChange={this.handlePublicChange} 
                  value="not-end"
                  />}
                label="Rendre mon e-mail visible"
              />
            </div>

            <Marger size="1rem" />

            <div className={classes.grid_two_column + " " + classes.gap}>
              {/* Nom / prénom */}
              <FormControl>
                <InputLabel htmlFor="fname-input">Prénom</InputLabel>
                <Input
                  type="text" 
                  id="fname-input" 
                  required
                  value={this.state.first_name ?? ""}
                  onChange={this.handleFirstNameChange}
                />
              </FormControl>

              <FormControl>
                <InputLabel htmlFor="name-input">Nom</InputLabel>
                <Input
                  type="text" 
                  id="name-input" 
                  required
                  value={this.state.last_name ?? ""}
                  onChange={this.handleLastNameChange}
                />
              </FormControl>

              {/* Année entrée / sortie, diplôme */}
              <FormControl className={classes.formControl}>
                <InputLabel id="year-in-select">Année d'entrée</InputLabel>
                <Select
                  labelId="year-in-select"
                  value={this.state.year_in}
                  onChange={this.handleYearInChange}
                  required
                >
                  {available_start_years.map(e => <MenuItem value={String(e)} key={e}>{e}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl className={classes.formControl}>
                <InputLabel id="year-out-select">Année de sortie</InputLabel>
                <Select
                  labelId="year-out-select"
                  value={this.state.year_out ?? "Aucune"}
                  onChange={this.handleYearOutChange}
                >
                  {!this.state.graduated && <MenuItem value="Aucune">Aucune</MenuItem>}
                  {available_end_years.map(e => <MenuItem value={String(e)} key={e}>{e}</MenuItem>)}
                </Select>
              </FormControl>
            </div>

            <Marger size="1rem" />

            <div className={classes.grid_two_column + " " + classes.gap}>
              <FormControlLabel
                className={classes.flex_end}
                control={<Checkbox 
                  checked={this.state.graduated} 
                  onChange={this.handleGraduatedChange} 
                  value="not-end"
                  disabled={cant_be_graduated}
                  />}
                label="Je suis diplômé•e du master"
              />

              {/* Est entrée en M1 */}
              <FormControlLabel
                control={<Checkbox checked={this.state.entered_in_m1} onChange={this.handleEnteredM1Change} value="not-end" />}
                label="Je suis entré•e dans le master en M1"
              />
            </div>

            <Marger size="1rem" />

            <div style={{ justifyContent: 'flex-end', display: 'flex', flexDirection: 'row' }}>
              <Button variant="outlined" type="submit" color="primary">
                Sauvegarder
              </Button>
            </div> 

            <Marger size="3rem" />
          </form>
        </div>
      </DashboardContainer> 
    );
  }
}
