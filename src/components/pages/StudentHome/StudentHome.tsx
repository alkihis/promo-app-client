import React, { useContext } from 'react';
import classes from './StudentHome.module.scss';
import { RouteComponentProps, useLocation, useRouteMatch, Switch, Route, Redirect, Link } from 'react-router-dom';
import { Location } from 'history';
import LoginWrapper, { GenericLoginWrapperProps } from '../../shared/LoginWrapper/LoginWrapper';
import SETTINGS, { LoggedLevel } from '../../../Settings';
import Dashboard, { DrawerSection, DashboardDrawer, DashboardContainer, DrawerListItem } from '../../shared/Dashboard/Dashboard';
import { ClassicModal, BigPreloader, uppercaseFirst, studentDashboardLink } from '../../../helpers';

import LogoutIcon from '@material-ui/icons/Block';
import ResumeIcon from '@material-ui/icons/Public';
import EditIcon from '@material-ui/icons/Edit';
import WorkIcon from '@material-ui/icons/Work';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import BackIcon from '@material-ui/icons/KeyboardBackspace';
import IntershipIcon from '@material-ui/icons/ImportContacts';
import { Student, Job, Internship, JobLevels, JobTypes } from '../../../interfaces';
import StudentJob from '../students/StudentJob/StudentJob';
import StudentContext, { ExtendedStudent } from '../../shared/StudentContext/StudentContext';
import AddStudentJob, { ModifyStudentJob } from '../students/StudentJob/AddStudentJob';
import StudentInternship from '../students/StudentJob/Internship/StudentIntership';
import AddStudentInternship, { ModifyStudentInternship } from '../students/StudentJob/Internship/AddStudentInternship';
import EmbeddedError from '../../shared/EmbeddedError/EmbeddedError';
import StudentInformations from '../students/Informations/StudentInformations';
import { Typography, Card, CardContent, CardActions, IconButton } from '@material-ui/core';
import APIHELPER from '../../../APIHelper';

type SPProps = RouteComponentProps & { student: ExtendedStudent };

export const StudentWrapper: React.FC<GenericLoginWrapperProps> = props => {
  return <LoginWrapper allowOn="student" {...props} />;
}

export const StudentSelfHome: React.FC<RouteComponentProps> = props => {
  return <StudentPage {...props} student={SETTINGS.logged_student!} />;
};

const ROUTES_AVAILABLE: {[name: string]: string} = {
  "Résumé": "",
  "Emplois": "job/",
  "Ajouter un emploi": "job/add/",
  "Modifier un emploi": "job/modify/",
  "Stages": "internship/",
  "Ajouter un stage": "internship/add/",
  "Modifier un stage": "internship/modify/",
  "Informations": "info/",
};

// Student router
const StudentPage: React.FC<SPProps> = props => {
  function makeDrawerSections(location: Location, base: string) : DrawerSection[] {
    const logout_option: DrawerListItem = {
      icon: LogoutIcon,
      text: "Déconnexion",
      onClick: handleOpen
    };

    if (SETTINGS.logged === LoggedLevel.teacher) {
      logout_option.text = "Retour aux étudiants";
      logout_option.icon = BackIcon;
    }

    return [{
      items: [{
        icon: ResumeIcon,
        text: "Résumé",
        selected: location.pathname === base,
        linkTo: base
      }, {
        icon: WorkIcon,
        text: "Emplois",
        selected: location.pathname.includes(base + ROUTES_AVAILABLE['Emplois']),
        linkTo: base + "job/"
      }, {
        icon: IntershipIcon,
        text: "Stages",
        selected: location.pathname.includes(base + ROUTES_AVAILABLE['Stages']),
        linkTo: base + "internship/"
      }, {
        icon: InfoIcon,
        text: "Informations",
        selected: location.pathname === base + ROUTES_AVAILABLE["Informations"],
        linkTo: base + "info/"
      },]
    }, {
      items: [logout_option]
    }];
  }

  const [modalopen, setOpen] = React.useState<boolean | undefined>(false);

  // utilisé pour retenir quel job/stage est en cours de modification
  const [job, setJob] = React.useState<Job | undefined>(undefined);
  const [internship, setInternship] = React.useState<Internship | undefined>(undefined);
  function setTheJob(evt: any) {
    setJob(evt.detail);
  }
  function setTheInternship(evt: any) {
    setInternship(evt.detail);
  }

  // Capture les évènements lançant la modification de job/stage
  React.useEffect(() => {
    window.addEventListener('modify.job', setTheJob);
    window.addEventListener('modify.internship', setTheInternship);

    return function cleanup() {
      window.removeEventListener('modify.job', setTheJob);
      window.removeEventListener('modify.internship', setTheInternship);
    }
  }, []);

  const handleOpen = () => {
    if (SETTINGS.logged === LoggedLevel.teacher) {
      setOpen(undefined);
    }
    else {
      setOpen(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleUnlog = () => {
    SETTINGS.unlog();
    window.location.pathname = "/";
  };

  const location = useLocation();
  const match = useRouteMatch()!;

  const url = match.url.endsWith('/') ? match.url : match.url + '/';

  const drawer_items = makeDrawerSections(location, url);

  let current_location = location.pathname.split(match.url).pop() ?? "";
  if (current_location.startsWith('/')) {
    current_location = current_location.slice(1);
  }

  const current_title = Object.entries(ROUTES_AVAILABLE).find(e => e[1] === current_location) ?? ["Page non trouvée"];

  if (modalopen === undefined) {
    return (
      <Redirect to="/teacher/student/all" /> 
    );
  }

  // RENDER
  return (
    <StudentContext.Provider value={props.student}>
      <Dashboard drawer={<DashboardDrawer sections={drawer_items} />} title={current_title[0]}>
        <ClassicModal
          open={modalopen}
          onCancel={handleClose}
          onClose={handleClose}
          onValidate={handleUnlog}
          text="Se déconnecter ?"
          validateText="Déconnexion"
          explaination="Vous devrez utiliser la clé fournie dans l'e-mail vous étant adressé pour accéder à votre tableau de bord à nouveau."
        />

        <Switch>
          {/** Jobs */}
          <Route exact path={`${url}job/modify/`} render={
            (p: RouteComponentProps) => 
              job ? 
                <ModifyStudentJob job={job} {...p} /> :
                <StudentNotFound {...p} />
          } />
          <Route exact path={`${url}job/add/`} component={AddStudentJob} />
          <Route exact path={`${url}job/`} component={StudentJob} />

          {/** Interships. */}
          <Route exact path={`${url}internship/modify/`} render={
            (p: RouteComponentProps) => 
              internship ? 
                <ModifyStudentInternship internship={internship} {...p} /> :
                <StudentNotFound {...p} />
          } />
          <Route exact path={`${url}internship/add/`} component={AddStudentInternship} />
          <Route 
            exact
            path={`${url}internship/`} 
            component={StudentInternship}   
          />

          {/** Modify student infos */}
          <Route 
            exact
            path={`${url}info/`} 
            component={StudentInformations}   
          /> 

          {/* Home page. */}
          <Route 
            path={url} 
            exact 
            component={StudentHomePage}  
          />

          {/* Not found. */}
          <Route component={StudentNotFound} />
        </Switch>
      </Dashboard>
    </StudentContext.Provider>
  );
}

export default StudentPage;

const StudentNotFound: React.FC<RouteComponentProps> = () => {
  // const context: Student = useContext(StudentContext);
  
  return <EmbeddedError text="Page non trouvée." />;
}

type SHPState = {
  info_loaded: boolean | number;
  jobs: Job[];
};

class StudentHomePage extends React.Component<RouteComponentProps, SHPState> {
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

    let text_time = "";
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

  renderContent() {
    return (
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

