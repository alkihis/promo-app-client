import React from 'react';
import classes from './Forms.module.scss';
import { DashboardContainer } from '../../../shared/Dashboard/Dashboard';
import { Typography, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, Input, FormHelperText, InputAdornment, Button } from '@material-ui/core';
import { Job, Company, Contact, Domain, Domains, JobLevels, JobTypes, JobLevel, JobType, Student } from '../../../../interfaces';
import CompanyModal, { CompanyResume } from './CompanyModal';
import { Marger, errorToText, studentDashboardLink } from '../../../../helpers';
import ContactModal, { ContactResume } from './ContactModal';
import DateFnsUtils from '@date-io/date-fns';
import { fr } from "date-fns/locale";
import {
  MuiPickersUtilsProvider,
  DatePicker,
} from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { toast } from '../../../shared/Toaster/Toaster';
import APIHELPER from '../../../../APIHelper';
import StudentContext from '../../../shared/StudentContext/StudentContext';
import { Link, Redirect } from 'react-router-dom';

export default class AddStudentJob extends React.Component {
  render() {
    return (
      <DashboardContainer maxWidth="md">
        <Typography variant="h4" className={classes.main_header} gutterBottom>
          Ajouter un emploi
        </Typography>
        <StudentJobForm />
      </DashboardContainer>
    );
  }
}

export class ModifyStudentJob extends React.Component<{ job: Job }> {
  render() {
    return (
      <DashboardContainer maxWidth="md">
        <Typography variant="h4" className={classes.main_header} gutterBottom>
          Modifier un emploi
        </Typography>
        <StudentJobForm existing={this.props.job} />
      </DashboardContainer>
    );
  }
}

type SJFProps = {
  existing?: Job
};

type SJFState = {
  existing?: Job;

  company?: Company;
  contact?: Contact;

  modal_company: boolean;
  modal_contact: boolean;

  start_date: Date;
  end_date?: Date;

  domain?: Domain;
  type?: JobType;
  level?: JobLevel;
  wage?: number;

  in_send: boolean | null;
};

class StudentJobForm extends React.Component<SJFProps, SJFState> {
  static contextType = StudentContext;
  context!: Student;

  constructor(props: SJFProps) {
    super(props);

    this.state = {
      modal_company: false,
      modal_contact: false,
      company: this.props.existing?.company,
      contact: this.props.existing?.referrer,
      start_date: new Date(),
      domain: "other",
      type: "cdi",
      level: "ingenieur",
      in_send: false,
      existing: this.props.existing,
    };
  }

  componentDidMount() {
    if (this.state.existing) {
      this.reset();
    }
  }

  componentDidUpdate(old_props: SJFProps) {
    if (this.props.existing !== old_props.existing) {
      this.setState({
        existing: this.props.existing
      });

      this.reset();
    }
  }

  reset() {
    this.setState({
      modal_company: false,
      modal_contact: false,
      company: this.state.existing?.company,
      contact: this.state.existing?.referrer,
      start_date: this.state.existing?.from ? new Date(this.state.existing.from) : new Date(),
      domain: this.state.existing?.domain ?? "other",
      type: this.state.existing?.type ?? "cdi",
      level: this.state.existing?.level ?? "ingenieur",
      in_send: false,
      wage: this.state.existing?.wage,
      end_date: this.state.existing?.to ? new Date(this.state.existing.to) : undefined,
    });
  }

  handleStartChange = (date: MaterialUiPickersDate) => {
    const d = date as Date;

    if (d && d.getTime() > Date.now()) {
      return;
    }

    if (d && this.state.end_date) {
      if (d.getTime() > this.state.end_date.getTime()) {
        this.setState({
          end_date: date as Date
        });
      }
    }

    this.setState({
      start_date: date as Date
    });
  };

  handleEndChange = (date: MaterialUiPickersDate) => {
    const d = date as Date;

    if (d && d.getTime() > Date.now()) {
      return;
    }

    if (d && this.state.start_date) {
      if (d.getTime() < this.state.start_date.getTime()) {
        this.setState({
          start_date: date as Date
        });
      }
    }

    this.setState({
      end_date: date as Date
    });
  };

  handleHasEndChange = (_: any, checked: boolean) => {
    if (checked) {
      this.setState({
        end_date: undefined
      });
    }
    else {
      this.setState({
        end_date: new Date()
      });
    }
  };

  handleDomainChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      domain: evt.target.value as Domain
    });
  };

  handleLevelChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      level: evt.target.value as JobLevel
    });
  };

  handleTypeChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      type: evt.target.value as JobType
    });
  };

  handleWageChange = (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = Number(evt.target.value);
    this.setState({
      wage: v ? v : undefined
    });
  };

  submitForm = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();

    if (!this.state.company) {
      toast("Vous n'avez précisé aucune entreprise.", "warning");
      return;
    }

    this.setState({
      in_send: true
    });

    let active_company = this.state.company;

    // L'entreprise doit être insérée
    if (active_company.id === 0) {
      try {
        active_company = await APIHELPER.request('company/create', {
          parameters: { 
            user_id: this.context.id,
            name: active_company.name,
            size: active_company.size,
            status: active_company.status,
            city: active_company.town,
          },
          method: 'POST'
        });

        this.setState({
          company: active_company
        });
      } catch (e) {
        toast("Impossible d'ajouter l'entreprise dans la base de données: " + errorToText(e), "error");
        this.setState({
          in_send: false
        });
        return;
      }
    }

    // Si le contact doit être inséré
    let contact = this.state.contact;
    if (contact && contact.id === 0) {
      try {
        contact = await APIHELPER.request('contact/create', {
          method: 'POST',
          parameters: {
            name: contact.name,
            mail: contact.email,
            id_entreprise: active_company.id
          }
        });

        this.setState({
          contact
        });
      } catch (e) {
        this.setState({
          in_send: false
        });
        toast("Impossible d'ajouter le contact dans la base de données: " + errorToText(e), "error");
        this.setState({
          in_send: false
        });
        return;
      }
    }

    // Sending job
    try {
      if (!this.state.existing) {
        const job: Job = await APIHELPER.request('job/create', {
          method: 'POST',
          parameters: {
            start: this.state.start_date.toDateString(),
            end: this.state.end_date?.toDateString() ?? null,
            contract: this.state.type,
            salary: this.state.wage ?? null,
            level: this.state.level,
            company: active_company.id,
            domain: this.state.domain,
            contact: this.state.contact?.id ?? null,
            user_id: this.context.id,
          }
        });
        toast("L'emploi a été créé avec succès.", "success");

        this.setState({
          existing: job,
          in_send: null
        });
      }
      else {
        const job: Job = await APIHELPER.request('job/modify', {
          method: 'POST',
          parameters: {
            start: this.state.start_date.toDateString(),
            end: this.state.end_date?.toDateString() ?? null,
            contract: this.state.type,
            salary: this.state.wage ?? null,
            level: this.state.level,
            company: active_company.id,
            domain: this.state.domain,
            contact: this.state.contact?.id ?? null,
            user_id: this.context.id,
            job: this.state.existing.id,
          }
        });

        console.log("Modified", job);
        toast("L'emploi a été modifié avec succès.", "success");

        this.setState({
          existing: job,
          in_send: null
        });
      }
    } catch (e) {
      toast("Impossible d'ajouter l'emploi dans la base de données: " + errorToText(e), "error");
      this.setState({
        in_send: false
      });
    }
  };

  render() {
    if (this.state.in_send === null) {
      return (
        <Redirect to={studentDashboardLink(this.context) + "job/"} />
      );
    }

    return (
      <div className={classes.container + " " + classes.dialog + " " + (this.state.in_send ? classes.in_load : "")}>
        <Typography variant="h5" gutterBottom>
          Entreprise
        </Typography>
        <CompanyModal 
          open={this.state.modal_company} 
          base={this.state.company}
          onClose={() => this.setState({ modal_company: false })} 
          onConfirm={c => {
            this.setState({ modal_company: false, company: c });

            if (this.state.contact?.linked_to !== c?.id) {
              this.setState({ contact: undefined });
            }
          }}
        />
        <CompanyResume 
          company={this.state.company} 
          onLinkClick={() => this.setState({ modal_company: true })} 
        /> 

        <Marger size="1rem" />

        <Typography variant="h5" gutterBottom>
          Contact
        </Typography>
        {this.state.company && <ContactModal 
          open={this.state.modal_contact} 
          company={this.state.company} 
          base={this.state.contact}
          onClose={() => this.setState({ modal_contact: false })} 
          onConfirm={c => this.setState({ modal_contact: false, contact: c })}
        />}
        <ContactResume 
          contact={this.state.contact} 
          onLinkClick={() => this.setState({ modal_contact: true })} 
          disabled={!this.state.company}
        /> 

        <Marger size="1rem" />

        <form onSubmit={this.submitForm}>
          <Typography variant="h5" gutterBottom>
            Dates
          </Typography>

          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={fr}>
            <div className={classes.flex_column_container}>
              <div className={classes.datepicker_container}>
                <DatePicker
                  margin="normal"
                  label="Début de l'emploi"
                  format="MM/yyyy"
                  views={['year', 'month']}
                  minDate={new Date('2015-01-01')}
                  maxDate={new Date()}
                  value={this.state.start_date}
                  onChange={this.handleStartChange}
                  required
                  okLabel="Confirmer"
                  cancelLabel="Annuler"
                />

                <DatePicker
                  margin="normal"
                  label="Fin de l'emploi"
                  format="MM/yyyy"
                  minDate={new Date('2015-01-01')}
                  maxDate={new Date()}
                  views={['year', 'month']}
                  value={this.state.end_date}
                  onChange={this.handleEndChange}
                  disabled={!this.state.end_date}
                  okLabel="Confirmer"
                  cancelLabel="Annuler"
                />
              </div>

              <FormControlLabel
                className={classes.flex_end}
                control={<Checkbox checked={!this.state.end_date} onChange={this.handleHasEndChange} value="not-end" />}
                label="J'occupe toujours cet emploi"
              />
            </div>
          </MuiPickersUtilsProvider>
        
          <Marger size="1rem" />

          <Typography variant="h5" gutterBottom>
            Informations sur l'emploi
          </Typography>

          <div className={classes.flex_column_container}>
            {/* Domaine */}
            <FormControl className={classes.flex_column_container}>
              <InputLabel id="label-select-domain">Domaine d'activité</InputLabel>
              <Select
                labelId="label-select-domain"
                value={this.state.domain}
                onChange={this.handleDomainChange}
                required
              >
                {Object.entries(Domains).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Marger size=".5rem" />

            {/* Salaire */}
            <FormControl>
              <InputLabel htmlFor="wage-input">Salaire brut annuel</InputLabel>
              <Input 
                type="number" 
                id="wage-input" 
                aria-describedby="wage-input-text" 
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                value={this.state.wage ?? ""}
                onChange={this.handleWageChange}
              />
              <FormHelperText id="wage-input-text">Ce champ est optionnel.</FormHelperText>
            </FormControl>

            <Marger size=".5rem" />

            {/* Niveau */}
            <FormControl className={classes.flex_column_container}>
              <InputLabel id="label-select-level">Niveau</InputLabel>
              <Select
                labelId="label-select-level"
                value={this.state.level}
                onChange={this.handleLevelChange}
                required
              >
                {Object.entries(JobLevels).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Marger size=".5rem" />

            {/* Type de contrat */}
            <FormControl className={classes.flex_column_container}>
              <InputLabel id="label-select-type">Type de contrat</InputLabel>
              <Select
                labelId="label-select-type"
                value={this.state.type}
                onChange={this.handleTypeChange}
                required
              >
                {Object.entries(JobTypes).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Marger size="1rem" />
          </div>
          
          <Marger size="1rem" />

          <div style={{ justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
            <Link 
              className="link no-underline" 
              to={studentDashboardLink(this.context) + "job/"}
            >
              <Button variant="outlined" type="button" color="secondary">
                Retour
              </Button>
            </Link>
            <Button variant="outlined" type="submit" color="primary">
              {this.state.existing ? "Modifier" : "Ajouter"} emploi
            </Button>
          </div> 

          <Marger size="3rem" />
        </form>
      </div>
    );
  }
}
