import React from 'react';
import classes from './StudentHome.module.scss';
import { RouteComponentProps, useLocation, useRouteMatch, Switch, Route } from 'react-router-dom';
import { Location } from 'history';
import LoginWrapper, { GenericLoginWrapperProps } from '../../shared/LoginWrapper/LoginWrapper';
import SETTINGS from '../../../Settings';
import Dashboard, { DrawerSection, DashboardDrawer, DashboardContainer } from '../../shared/Dashboard/Dashboard';
import { ClassicModal } from '../../../helpers';

import LogoutIcon from '@material-ui/icons/Block';
import ResumeIcon from '@material-ui/icons/Public';
import WorkIcon from '@material-ui/icons/Work';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import IntershipIcon from '@material-ui/icons/ImportContacts';
import { Student } from '../../../interfaces';

type SPProps = RouteComponentProps & { student: Student };

export const StudentWrapper: React.FC<GenericLoginWrapperProps> = props => {
  return <LoginWrapper allowOn="student" {...props} />;
}

export const StudentSelfHome: React.FC<RouteComponentProps> = props => {
  return <StudentPage {...props} student={SETTINGS.logged_student!} />;
};

const ROUTES_AVAILABLE: {[name: string]: string} = {
  "Résumé": "",
  "Emplois": "job",
  "Stages": "intership",
  "Informations": "info",
};

// Teacher router
const StudentPage: React.FC<SPProps> = props => {
  function makeDrawerSections(location: Location, base: string) : DrawerSection[] {
    return [{
      items: [{
        icon: ResumeIcon,
        text: "Résumé",
        selected: location.pathname === base + ROUTES_AVAILABLE['Résumé'],
        linkTo: base
      }, {
        icon: WorkIcon,
        text: "Emplois",
        selected: location.pathname === base + ROUTES_AVAILABLE['Emplois'],
        linkTo: base + "job"
      }, {
        icon: IntershipIcon,
        text: "Stages",
        selected: location.pathname === base + ROUTES_AVAILABLE['Stages'],
        linkTo: base + "intership"
      }, {
        icon: InfoIcon,
        text: "Informations",
        selected: location.pathname === base + ROUTES_AVAILABLE["Informations"],
        linkTo: base + "info"
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

  const url = match.url.endsWith('/') ? match.url : match.url + '/';

  const drawer_items = makeDrawerSections(location, url);

  let current_location = location.pathname.split(match.url).pop() ?? "";
  if (current_location.startsWith('/')) {
    current_location = current_location.slice(1);
  }

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

      {/* TODO set routes */}
      <Switch>
        {/** Jobs */}
        <Route 
          path={`${url}job`} 
          component={(p: RouteComponentProps) => <StudentHomePage {...p} student={props.student} />} 
        />

        {/** Interships. */}
        <Route 
          path={`${url}intership`} 
          component={(p: RouteComponentProps) => <StudentHomePage {...p} student={props.student} />}   
        />

        {/** Modify student infos */}
        <Route 
          path={`${url}info`} 
          component={(p: RouteComponentProps) => <StudentHomePage {...p} student={props.student} />}   
        /> 

        {/* Home page. */}
        <Route 
          path={url} 
          exact 
          component={(p: RouteComponentProps) => <StudentHomePage {...p} student={props.student} />}  
        />

        {/* Not found. */}
        <Route component={(p: RouteComponentProps) => <StudentNotFound {...p} student={props.student} />} />
      </Switch>
    </Dashboard>
  );
}

export default StudentPage;

class StudentHomePage extends React.Component<SPProps> {
  render() {
    console.log(this.props)
    return (
      <DashboardContainer>
        Hello, i'm the student dashboard.
        <br />
        <pre>
          {JSON.stringify(this.props.student, null, 2)}
        </pre>
      </DashboardContainer>
    );
  }
}

const StudentNotFound: React.FC<SPProps> = props => {
  return (
    <div>
      Page not found ({props.location.pathname})
    </div>
  );
}

