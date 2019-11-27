import React from 'react';
import Dashboard, { DrawerSection, DashboardDrawer, DashboardContainer } from '../../shared/Dashboard/Dashboard';
import SETTINGS from '../../../Settings';
import { Route, RouteComponentProps, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import { Location } from 'history';
import TeacherStudents from '../TeacherStudents/TeacherStudents';
import AddStudent from '../AddStudent/AddStudent';

import LogoutIcon from '@material-ui/icons/Block';
import StudentIcon from '@material-ui/icons/People';
import AddStudentIcon from '@material-ui/icons/PersonAdd';
import StatsIcon from '@material-ui/icons/InsertChart';
import WorkIcon from '@material-ui/icons/Work';
import FormationIcon from '@material-ui/icons/AccountBalance';
import ResumeIcon from '@material-ui/icons/Public';
import DomainIcon from '@material-ui/icons/Domain';
import { ClassicModal, notifyError, BigPreloader, DividerMargin } from '../../../helpers';
import ModifyCompany from '../Administration/Entreprises/Entreprises';
import ModifyContacts from '../Administration/Entreprises/ContactEdit';
import ModifyFormation from '../Administration/Formations/Formations';
import ModifyDomains from '../Administration/Domaines/Domaines';
import APIHELPER from '../../../APIHelper';
import { Typography } from '@material-ui/core';
import EmbeddedError from '../../shared/EmbeddedError/EmbeddedError';
import TeacherStats from '../Stats/Stats';

const ROUTES_AVAILABLE: {[name: string]: string} = {
  "Résumé": "",
  "Étudiants": "student/all",
  "Ajout d'étudiant": "student/add",
  "Statistiques": "stats",
  "Entreprises": "companies",
  "Contacts": "contact/",
  "Formations": "formations",
  "Domaines": "domains",
};

// Teacher router
const TeacherPage: React.FC = () => {
  function makeDrawerSections(location: Location, base: string) : DrawerSection[] {
    return [{
      items: [{
        icon: ResumeIcon,
        text: "Résumé",
        selected: location.pathname === base + ROUTES_AVAILABLE['Résumé'],
        linkTo: base
      }, {
        icon: StudentIcon,
        text: "Étudiants",
        selected: location.pathname === base + ROUTES_AVAILABLE['Étudiants'],
        linkTo: base + "student/all"
      }, {
        icon: AddStudentIcon,
        text: "Ajout d'étudiant",
        selected: location.pathname === base + ROUTES_AVAILABLE["Ajout d'étudiant"],
        linkTo: base + "student/add"
      }, {
        icon: StatsIcon,
        text: "Statistiques",
        selected: location.pathname === base + ROUTES_AVAILABLE['Statistiques'],
        linkTo: base + "stats"
      }]
    }, {
      items: [{
        icon: WorkIcon,
        text: "Entreprises",
        selected: location.pathname === base + ROUTES_AVAILABLE['Entreprises'],
        linkTo: base + "companies"
      }, {
        icon: FormationIcon,
        text: "Formations",
        selected: location.pathname === base + ROUTES_AVAILABLE['Formations'],
        linkTo: base + "formations"
      }, {
        icon: DomainIcon,
        text: "Domaines",
        selected: location.pathname === base + ROUTES_AVAILABLE['Domaines'],
        linkTo: base + "domains"
      },]
    }, {
      items: [{
        icon: LogoutIcon,
        text: "Déconnexion",
        onClick: handleOpen
      }]
    }];
  }

  const [modalopen, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
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
  const drawer_items = makeDrawerSections(location, match.path);

  const current_location = location.pathname.split(match.path).pop() ?? "";

  const current_title = 
    Object.entries(ROUTES_AVAILABLE).find(e => e[1] === current_location) ?? 
    Object.entries(ROUTES_AVAILABLE).find(e => e[1] && current_location.startsWith(e[1])) ??
    ["Page non trouvée"];

  return (
    <Dashboard drawer={<DashboardDrawer sections={drawer_items} />} title={current_title[0]}>
      <ClassicModal 
        open={modalopen}
        onCancel={handleClose}
        onClose={handleClose}
        onValidate={handleUnlog}
        text="Se déconnecter ?"
        validateText="Déconnexion"
        explaination="Vous devrez entrer votre mot de passe à nouveau pour accéder au tableau de bord et gérer les étudiants."
      />

      <Switch>
        {/** 
          Show students 
          All data for student, selector for student (sort information, deletion...)
          And mail send
        */}
        <Route path={`${match.path}student/all`} component={TeacherStudents} />

        {/** Add a new student (enter basic informations about him/her). */}
        <Route path={`${match.path}student/add`} component={AddStudent} />

        {/** Statistics */}
        <Route path={`${match.path}stats`} component={TeacherStats} /> 

        {/** Entreprises */}
        <Route path={`${match.path}companies`} component={ModifyCompany} /> 

        {/** Formations */}
        <Route path={`${match.path}formations`} component={ModifyFormation} /> 

        {/** Domaines */}
        <Route path={`${match.path}domains`} component={ModifyDomains} /> 

        {/** Contacts de l'entreprise */}
        <Route path={`${match.path}contact/:id`} component={ModifyContacts} /> 

        {/* Home page. */}
        <Route path={`${match.path}`} exact component={TeacherHomePage} />

        {/* Not found. */}
        <Route component={TeacherNotFound} />
      </Switch>
    </Dashboard>
  );
};

export default TeacherPage;


//// HOME Page
interface HomeStats {
  companies_with_work: number;
  graduated: number;
  in_formation: number;
  students: number;
  students_currently_working: number;
  thesis: number;
}

const TeacherHomePage: React.FC = () => {
  const [stats, setStats] = React.useState<HomeStats | undefined>(undefined);

  React.useEffect(() => {
    APIHELPER.request('teacher/home_stats')
      .then(setStats)
      .catch(notifyError);
  }, []);

  function show(n: number) {
    return n === 0 ? "Aucun" : String(n);
  }

  function s(n: number) {
    return n > 1 ? "s" : "";
  }

  function ontOrA(n: number) {
    return n > 1 ? "ont" : "a";
  }

  if (!stats) {
    return <BigPreloader style={{ marginTop: '2rem' }} />;
  }

  return (
    <DashboardContainer>
      <Typography variant="h3" gutterBottom className="bold">
        Bienvenue.
      </Typography>

      <Typography variant="h6">
        {show(stats.students)} étudiant{s(stats.students)} enregistrés
      </Typography>

      <Typography color="textSecondary">
        {show(stats.in_formation)} en formation, {show(stats.graduated)} diplômé{s(stats.graduated)}.
      </Typography>

      <DividerMargin size=".7rem" />

      <Typography variant="h6">
        {show(stats.students_currently_working)} étudiant{s(stats.students_currently_working)} {ontOrA(stats.students_currently_working)} un emploi
      </Typography>

      <Typography color="textSecondary">
        {show(stats.thesis)} en thèse, {show(stats.companies_with_work)} entreprise{s(stats.companies_with_work)} embauchant actuellement.
      </Typography>
    </DashboardContainer>
  );
};


//// NOT FOUND Page
const TeacherNotFound: React.FC<RouteComponentProps> = props => {
  return <EmbeddedError text={`Page non trouvée (${props.location.pathname})`} />;
};
