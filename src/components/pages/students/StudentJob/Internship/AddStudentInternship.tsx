import classes from '../Forms.module.scss';
import React from 'react';
import { DashboardContainer } from '../../../../shared/Dashboard/Dashboard';
import { Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@material-ui/core';
import { Company, Contact, Domain, Domains, Student, Internship } from '../../../../../interfaces';
import CompanyModal, { CompanyResume } from '../CompanyModal';
import { Marger, errorToText, studentDashboardLink } from '../../../../../helpers';
import ContactModal, { ContactResume } from '../ContactModal';
import { toast } from '../../../../shared/Toaster/Toaster';
import APIHELPER from '../../../../../APIHelper';
import StudentContext from '../../../../shared/StudentContext/StudentContext';
import { Link, Redirect } from 'react-router-dom';

export default class AddStudentInternship extends React.Component {
  render() {
    return (
      <DashboardContainer maxWidth="md">
        <Typography variant="h4" className={classes.main_header} gutterBottom>
          Ajouter un stage
        </Typography>
        <StudentInternshipForm />
      </DashboardContainer>
    );
  }
}

export class ModifyStudentInternship extends React.Component<{ internship: Internship }> {
  render() {
    return (
      <DashboardContainer maxWidth="md">
        <Typography variant="h4" className={classes.main_header} gutterBottom>
          Modifier un stage
        </Typography>
        <StudentInternshipForm existing={this.props.internship} />
      </DashboardContainer>
    );
  }
}

type SIFProps = {
  existing?: Internship
};

type SIFState = {
  existing?: Internship;

  company?: Company;
  contact?: Contact;

  modal_company: boolean;
  modal_contact: boolean;

  during: string;
  domain?: Domain;

  in_send: boolean | null;
};

class StudentInternshipForm extends React.Component<SIFProps, SIFState> {
  static contextType = StudentContext;
  context!: Student;

  constructor(props: SIFProps) {
    super(props);

    this.state = {
      modal_company: false,
      modal_contact: false,
      company: this.props.existing?.company,
      contact: this.props.existing?.referrer,
      domain: "other",
      during: String((new Date()).getFullYear()),
      in_send: false,
      existing: this.props.existing,
    };
  }

  componentDidMount() {
    if (this.state.existing) {
      this.reset();
    }
  }

  componentDidUpdate(old_props: SIFProps) {
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
      during: this.state.existing?.during ?? String((new Date()).getFullYear()),
      domain: this.state.existing?.domain ?? "other",
      in_send: false,
    });
  }

  handleDuringChange = (evt: any) => {
    // TODO check if date is valid

    this.setState({
      during: evt.target.value as string
    });
  };

  handleDomainChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      domain: evt.target.value as Domain
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
        const internship: Internship = await APIHELPER.request('internship/create', {
          method: 'POST',
          parameters: {
            promo_year: this.state.during,
            company: active_company.id,
            domain: this.state.domain,
            contact: this.state.contact?.id ?? null,
            user_id: this.context.id,
          }
        });
        toast("Le stage a été créé avec succès.", "success");

        this.setState({
          existing: internship,
          in_send: null
        });
      }
      else {
        const internship: Internship = await APIHELPER.request('internship/modify', {
          method: 'POST',
          parameters: {
            promo_year: this.state.during,
            company: active_company.id,
            domain: this.state.domain,
            contact: this.state.contact?.id ?? null,
            user_id: this.context.id,
            internship: this.state.existing.id,
          }
        });

        console.log("Modified", internship);
        toast("Le stage a été modifié avec succès.", "success");

        this.setState({
          existing: internship,
          in_send: null
        });
      }
    } catch (e) {
      toast("Impossible d'ajouter le stage dans la base de données: " + errorToText(e), "error");
      this.setState({
        in_send: false
      });
    }
  };

  render() {
    if (this.state.in_send === null) {
      return (
        <Redirect to={studentDashboardLink(this.context) + "internship/"} />
      );
    }

    // Génération des années possibles
    // todo générer années valides pour cet étudiant
    const available_years: number[] = [];
    for (let i = 2019; i >= 2015; i--) {
      available_years.push(i);
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
            Informations sur le stage
          </Typography>

          <div className={classes.flex_column_container}>
            {/* Date */}
            <FormControl className={classes.year_select}>
              <InputLabel id="during-year">Année du stage</InputLabel>
              <Select
                labelId="during-year"
                value={this.state.during}
                required
                onChange={this.handleDuringChange}
              >
                {available_years.map(year => <MenuItem key={year} value={String(year)}>{year}</MenuItem>)}
              </Select>
            </FormControl>

            <Marger size="1rem" />

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
          </div>
          
          <Marger size="1rem" />

          <div style={{ justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
            <Link 
              className="link no-underline"
              to={studentDashboardLink(this.context) + "internship/"} 
            >
              <Button variant="outlined" type="button" color="secondary">
                Retour
              </Button>
            </Link>
            <Button variant="outlined" type="submit" color="primary">
              {this.state.existing ? "Modifier" : "Ajouter"} stage
            </Button>
          </div> 

          <Marger size="3rem" />
        </form>
      </div>
    );
  }
}
