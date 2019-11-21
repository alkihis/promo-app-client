import React from 'react';
import classes from './Teacher.module.scss';
import Dashboard, { DrawerSection, DashboardDrawer } from '../../shared/Dashboard/Dashboard';
import SETTINGS from '../../../Settings';
import { Route, RouteComponentProps, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import { Location } from 'history';
import TeacherStudents from '../TeacherStudents/TeacherStudents';
import AddStudent from '../AddStudent/AddStudent';

import LogoutIcon from '@material-ui/icons/Block';
import StudentIcon from '@material-ui/icons/People';
import AddStudentIcon from '@material-ui/icons/PersonAdd';
import StatsIcon from '@material-ui/icons/InsertChart';
import MailingIcon from '@material-ui/icons/Mail';
import ResumeIcon from '@material-ui/icons/Public';
import { ClassicModal } from '../../../helpers';

const ROUTES_AVAILABLE: {[name: string]: string} = {
  "Résumé": "",
  "Étudiants": "student/all",
  "Ajout d'étudiant": "student/add",
  "Statistiques": "stats"
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
  const current_title = Object.entries(ROUTES_AVAILABLE).find(e => e[1] === current_location) ?? ["Page non trouvée"];

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
        <Route path={`${match.path}stats`} component={TeacherStudents} /> 

        {/* Home page. */}
        <Route path={`${match.path}`} exact component={TeacherHomePage} />

        {/* Not found. */}
        <Route component={TeacherNotFound} />
      </Switch>
    </Dashboard>
  );
}

export default TeacherPage;

class TeacherHomePage extends React.Component {
  render() {
    return (
      <div>
        Hello, i'm the teacher dashboard {String(SETTINGS.logged)}
      </div>
    );
  }
}

const TeacherNotFound: React.FC<RouteComponentProps> = props => {
  return (
    <div>
      Page not found ({props.location.pathname})
    </div>
  );
}
