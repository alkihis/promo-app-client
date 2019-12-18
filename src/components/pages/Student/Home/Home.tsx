import {Job, JobLevels, JobTypes, Student} from "../../../../interfaces";
import React from "react";
import {Link, RouteComponentProps} from "react-router-dom";
import StudentContext from "../../../shared/StudentContext/StudentContext";
import APIHELPER from "../../../../utils/APIHelper";
import {toast} from "../../../shared/Toaster/Toaster";
import {BigPreloader, notifyError, studentDashboardLink, uppercaseFirst} from "../../../../utils/helpers";
import EmbeddedError from "../../../shared/EmbeddedError/EmbeddedError";
import {Card, CardActions, CardContent, IconButton, Link as MuiLink, Paper, Typography} from "@material-ui/core";
import classes from "./Home.module.scss";
import WorkIcon from "@material-ui/icons/Work";
import EditIcon from "@material-ui/icons/Edit";
import {DashboardContainer} from "../../../shared/Dashboard/Dashboard";

type SHPState = {
  info_loaded: boolean | number;
  jobs: Job[];
};

export default class StudentHomePage extends React.Component<RouteComponentProps, SHPState> {
  static contextType = StudentContext;
  context!: Student;
  state: SHPState = {
    info_loaded: false,
    jobs: []
  };

  componentDidMount() {
    // Doit télécharger les infos liées au dashboard
    // (emplois actifs, )
    APIHELPER.request('job/actives', { parameters: { user_id: this.context.id } })
      .then((j: Job[]) => {
        this.setState({
          jobs: j,
          info_loaded: true
        });
      })
      .catch(e => {
        let error: any = e?.[1]?.code;
        this.setState({
          info_loaded: error
        });
      });
  }

  refreshLastUpdate = () => {
    this.context.last_update = (new Date()).toString();

    // Refresh le composant
    this.forceUpdate();

    APIHELPER
      .request('student/confirm', { parameters: { user_id: this.context.id } })
      .then(() => toast("Votre profil a été actualisé."))
      .catch(notifyError);
  };

  renderLoading() {
    return <BigPreloader style={{ marginTop: '50px' }} />;
  }

  renderError() {
    return <EmbeddedError error={this.state.info_loaded as number} />;
  }

  renderLastJob() {
    if (this.state.info_loaded === false) {
      return this.renderLoading();
    }
    if (this.state.info_loaded !== true) {
      return this.renderError();
    }

    const last_job = (this.state.jobs as Job[])[0];

    if (!last_job) {
      return (
        <Typography color="textSecondary">
          Vous n'avez aucun emploi actif.
          <br />
          En <Link className="link-blue" to={studentDashboardLink(this.context) + "job/add/"}>
          ajouter un
        </Link> ?
        </Typography>
      );
    }

    const today = new Date();
    const diff = new Date(today.getTime() - (new Date(last_job.from)).getTime());
    const month = diff.getMonth() ? diff.getMonth() : undefined;
    const year = diff.getFullYear() - 1970;

    let text_time: string;
    if (year) {
      text_time = `${year} an${year > 1 ? "s" : ""}`;
    }
    else {
      text_time = month ? `${month} mois` : "ce mois-ci";
    }


    return (
      <Card>
        <CardContent>
          <Typography variant="h6">
            {last_job.company.name} {" "}
            <Typography
              component="span"
              className={classes.small}
              color="textSecondary"
            >{last_job.company.town}</Typography>
          </Typography>

          <Typography>
            Depuis {text_time}, {JobLevels[last_job.level]}
          </Typography>

          <Typography color="textSecondary">
            {JobTypes[last_job.type]}
          </Typography>
        </CardContent>
        <CardActions className={classes.actions_job}>
          {/* Vers emplois */}
          <Link to={studentDashboardLink(this.context) + "job/"}>
            <IconButton size="small">
              <WorkIcon />
            </IconButton>
          </Link>

          {/* Vers modification de cet emploi */}
          <Link
            to={studentDashboardLink(this.context) + "job/modify/"}
            onClick={() => window.dispatchEvent(new CustomEvent('modify.job', { detail: last_job }))}
          >
            <IconButton size="small" color="secondary">
              <EditIcon />
            </IconButton>
          </Link>
        </CardActions>
      </Card>
    );
  }

  renderYou() {
    const you = this.context;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {uppercaseFirst(you.first_name)} {uppercaseFirst(you.last_name)}
          </Typography>

          <Typography gutterBottom>
            {you.year_out && `Promotion ${you.year_out} ${you.graduated ? "(Diplômé•e)" : ""}`}

            {!you.year_out && `Entré•e dans le master Bio-Informatique en ${you.year_in}.`}
          </Typography>

          {you.graduated && !you.year_out && <Typography className={classes.no_year_out} gutterBottom>
              Votre promotion de sortie n'est pas enregistrée.
              <br />
              Rendez-vous dans la section <Link
              className="link-blue"
              to={studentDashboardLink(you) + "info/"}
          >
              Informations
          </Link> pour la saisir.
          </Typography>}

          <Typography color="textSecondary">
            {you.email}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  renderWarningLongActualisation() {
    const actual_last_update = new Date(this.context.last_update);

    const diff = new Date(Date.now() - actual_last_update.getTime());
    const nb_months = diff.getMonth();
    const nb_years = diff.getFullYear() - 1970;

    if (!nb_months && !nb_years) {
      return "";
    }

    let msg: string;
    if (nb_years) {
      msg = "depuis " + String(nb_years) + " an" + (nb_years > 1 ? "s" : "");
    }
    else {
      msg = "depuis " + String(nb_months) + " mois";
    }

    return (
      <Paper className={classes.warning_long_actual}>
        Votre profil n'a pas été mis à jour <strong>{msg}</strong>.
        Si votre situation n'a pas changé, cliquez simplement {""}
        <strong>
          <MuiLink href="#!" color="primary" onClick={this.refreshLastUpdate}>ici</MuiLink>
        </strong>.
      </Paper>
    );
  }

  renderContent() {
    return (
      <>
        {this.renderWarningLongActualisation()}

        <div className={classes.home_root}>
          <div>
            {/* Informations personnelles */}
            <Typography variant="h5" gutterBottom>
              Vous
            </Typography>

            {this.renderYou()}
          </div>

          <div>
            {/* Dernier emploi */}
            <Typography variant="h5" gutterBottom>
              Emploi en cours
            </Typography>

            {this.renderLastJob()}
          </div>
        </div>
      </>
    );
  }

  render() {
    return (
      <DashboardContainer maxWidth="md">
        <Typography variant="h3" style={{ fontWeight: 600 }} gutterBottom>
          Bienvenue, {uppercaseFirst(this.context.first_name)}.
        </Typography>

        {this.renderContent()}
      </DashboardContainer>
    );
  }
}


