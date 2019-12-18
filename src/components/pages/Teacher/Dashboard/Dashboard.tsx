import React from 'react';
import Dashboard, { DrawerSection, DashboardDrawer } from '../../../shared/Dashboard/Dashboard';
import SETTINGS from '../../../../utils/Settings';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import { Location } from 'history';
import Students from '../Students/Students';
import AddStudent from '../AddStudent/AddStudent';
import LogoutIcon from '@material-ui/icons/Block';
import StudentIcon from '@material-ui/icons/People';
import AddStudentIcon from '@material-ui/icons/PersonAdd';
import StatsIcon from '@material-ui/icons/InsertChart';
import WorkIcon from '@material-ui/icons/Work';
import FormationIcon from '@material-ui/icons/AccountBalance';
import ResumeIcon from '@material-ui/icons/Public';
import DomainIcon from '@material-ui/icons/Domain';
import AskCreationIcon from '@material-ui/icons/ContactMail';
import { ClassicModal } from '../../../../utils/helpers';
import ModifyCompany from '../Entreprises/Entreprises';
import ModifyContacts from '../Entreprises/ContactEdit';
import SendAskCreation from '../SendAskCreation/SendAskCreation';
import ModifyFormation from '../Formations/Formations';
import ModifyDomains from '../Domaines/Domaines';
import TeacherStats from '../Stats/Stats';
import TeacherNotFound from '../../NotFound/TeacherNotFound';
import TeacherHomePage from "../Home/Home";

const ROUTES_AVAILABLE: {[name: string]: string} = {
  "Résumé": "",
  "Étudiants": "student/all",
  "Ajout d'étudiant": "student/add",
  "Statistiques": "stats",
  "Entreprises": "companies",
  "Contacts": "contact/",
  "Formations": "formations",
  "Domaines": "domains",
  "Demande de création": "student/ask_creation",
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
        icon: AskCreationIcon,
        text: "Demande de création",
        selected: location.pathname === base + ROUTES_AVAILABLE["Demande de création"],
        linkTo: base + "student/ask_creation"
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
        <Route path={`${match.path}student/all`} component={Students} />

        {/** Add a new student (enter basic informations about him/her). */}
        <Route path={`${match.path}student/add`} component={AddStudent} />

        {/** Ask account creation */}
        <Route path={`${match.path}student/ask_creation`} component={SendAskCreation} /> 

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
