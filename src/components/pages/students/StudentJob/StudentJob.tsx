import classes from './StudentJob.module.scss';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Job, Domains } from '../../../../interfaces';
import StudentContext, { ExtendedStudent } from '../../../shared/StudentContext/StudentContext';
import APIHELPER from '../../../../APIHelper';
import { BigPreloader, notifyError, DividerMargin, dateFormatter, studentDashboardLink } from '../../../../helpers';
import { toast } from '../../../shared/Toaster/Toaster';
import EmbeddedError, { EmbeddedInfo }  from '../../../shared/EmbeddedError/EmbeddedError';
import { Link } from 'react-router-dom';
import { DashboardContainer } from '../../../shared/Dashboard/Dashboard';
import { Card, CardContent, Typography, Button, CardActions, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteSweep';

type SJProps = RouteComponentProps;

type SJState = {
  jobs?: Job[] | number;
  in_delete: boolean;
  modal_delete: number | false
};

export default class StudentJob extends React.Component<SJProps, SJState> {
  static contextType = StudentContext;
  context!: ExtendedStudent;

  constructor(props: SJProps) {
    super(props);

    this.state = {
      jobs: undefined,
      in_delete: false,
      modal_delete: false,
    };
  }

  componentDidMount() {
    APIHELPER.request('job/all', { parameters: { id: this.context.id } })
      .then((jobs: Job[]) => {
        this.setState({
          jobs
        });
      })
      .catch(e => {
        if (Array.isArray(e) && APIHELPER.isApiError(e[1])) {
          this.setState({
            jobs: e[1].code
          });
        }
        else {
          toast("Erreur réseau.");
        }
      });
  }

  handleDeleteJob = () => {
    this.setState({
      in_delete: true
    });

    const id = this.state.modal_delete as number;

    APIHELPER.request('job/' + String(id), {
      method: 'DELETE',
      parameters: {
        user_id: this.context.id
      }
    }).then(() => {
      this.setState({
        jobs: (this.state.jobs as Job[]).filter(j => j.id !== id),
        in_delete: false,
        modal_delete: false
      });
    }).catch(e => {
      notifyError(e);
      this.setState({
        in_delete: false,
        modal_delete: false
      });
    })
  };

  handleModalOpen = (id: number) => {
    this.setState({
      modal_delete: id
    });
  }

  handleModalClose = () => {
    this.setState({
      modal_delete: false
    });
  }

  renderModalDeleteJob() {
    return (
      <Dialog open={!!this.state.modal_delete} onClose={this.handleModalClose}>
        <DialogTitle>Supprimer l'emploi ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Cet emploi sera supprimé définitivement.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleModalClose} color="secondary" autoFocus>
            Annuler
          </Button>
          <Button onClick={this.handleDeleteJob} color="primary" disabled={this.state.in_delete}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderLoading() {
    return <BigPreloader style={{ marginTop: '50px' }} />;
  }

  renderError() {
    return <EmbeddedError error={this.state.jobs as number} />
  }

  renderEmpty() {
    return <EmbeddedInfo 
      text="Vous n'avez aucun emploi enregistré" 
      link={{
        to: studentDashboardLink(this.context) + "job/add/",
        internal: true,
        text: "Ajouter un emploi"
      }}
    />;
  }

  renderJob = (j: Job) => {
    const from = dateFormatter("F Y", new Date(j.from));
    let end = "";

    if (j.to) {
      end = dateFormatter("F Y", new Date(j.to));

      if (end === from) {
        end = "";
      }
    }

    return (
      <Card key={j.id} className={classes.card}>
        <CardContent>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
            {Domains[j.domain]}
          </Typography>
          <Typography variant="h5">
            {j.company.name} <span className={classes.job_town}>{j.company.town}</span>
          </Typography>
          <Typography className={classes.date_job} color="textSecondary">
            {/* todo formatter les dates */}
            {from} {j.to ? (end ? "- " + end : "") : "- Maintenant"}
          </Typography>
          <Typography variant="body2">
            
          </Typography>
        </CardContent>
        <CardActions style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link 
            to={studentDashboardLink(this.context) + "job/modify/"}
            onClick={() => window.dispatchEvent(new CustomEvent('modify.job', { detail: j }))} 
            className="link no-underline"
          >
            <IconButton size="small" color="secondary">
              <EditIcon />
            </IconButton>
          </Link>

          <IconButton size="small" color="primary" onClick={() => this.handleModalOpen(j.id)}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    )
  }

  renderJobs() {
    // Organisation des emplois
    const all = this.state.jobs as Job[];
  
    const sort_fn = (a: Job, b: Job) => (new Date(b.from)).getTime() - (new Date(a.from)).getTime();

    // Trie les jobs par passé/en cours et par date de début
    const current_jobs = all.filter(j => !j.to).sort(sort_fn);
    const past_jobs = all.filter(j => j.to).sort(sort_fn);    

    return <DashboardContainer maxWidth="md" className={classes.dialog + " " + (this.state.in_delete ? classes.in_load : "")}>
      {this.renderModalDeleteJob()}
      
      {!!current_jobs.length && <div className={classes.job_container}>
        <Typography variant="h4" className={classes.job_container_header} gutterBottom>
          Emploi{current_jobs.length > 1 ? "s" : ""} en cours
        </Typography>

        {current_jobs.map(this.renderJob)}
      </div>}

      {!!past_jobs.length && !!current_jobs.length && <DividerMargin size="2rem" />}

      {!!past_jobs.length && <div className={classes.job_container}>
        <Typography variant="h4" className={classes.job_container_header} gutterBottom>
          Emplois passés
        </Typography>

        {past_jobs.map(this.renderJob)}
      </div>}

      <DividerMargin size="1.5rem" />

      <Typography variant="h5" style={{ textAlign: 'center' }}>
        <Link to={studentDashboardLink(this.context) + "job/add/"} className="link no-underline">
          <Button variant="outlined" fullWidth>
            Ajouter un emploi
          </Button>
        </Link>
      </Typography>
    </DashboardContainer>;
  }

  render() {
    if (this.state.jobs === undefined) {
      return this.renderLoading();
    }

    if (typeof this.state.jobs === 'number') {
      return this.renderError();
    }

    // is array
    if (this.state.jobs.length === 0) {
      return this.renderEmpty();
    }

    return this.renderJobs();
  }
}
