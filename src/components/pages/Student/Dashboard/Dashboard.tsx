import {Redirect, Route, RouteComponentProps, Switch, useLocation, useRouteMatch} from "react-router-dom";
import StudentContext, {ExtendedStudent} from "../../../shared/StudentContext/StudentContext";
import React from "react";
import LoginWrapper, {GenericLoginWrapperProps} from "../../../shared/LoginWrapper/LoginWrapper";
import SETTINGS, {LoggedLevel} from "../../../../utils/Settings";
import {Location} from "history";
import Dashboard, {DashboardDrawer, DrawerListItem, DrawerSection} from "../../../shared/Dashboard/Dashboard";
import LogoutIcon from "@material-ui/icons/Block";
import BackIcon from "@material-ui/icons/KeyboardBackspace";
import ResumeIcon from "@material-ui/icons/Public";
import WorkIcon from "@material-ui/icons/Work";
import IntershipIcon from "@material-ui/icons/ImportContacts";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import {Internship, Job} from "../../../../interfaces";
import {ClassicModal} from "../../../../utils/helpers";
import AddStudentJob, {ModifyStudentJob} from "../Job/AddJob";
import StudentJob from "../Job/Job";
import AddInternship, {ModifyStudentInternship} from "../Internship/AddInternship";
import StudentInternship from "../Internship/Internship";
import StudentInformations from "../Informations/StudentInformations";
import StudentNotFound from "../../NotFound/StudentNotFound";
import StudentHomePage from "../Home/Home";

type SPProps = RouteComponentProps & { student: ExtendedStudent };

export const StudentWrapper: React.FC<GenericLoginWrapperProps> = props => {
  return <LoginWrapper allowOn="student" {...props} />;
};

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
          <Route exact path={`${url}internship/add/`} component={AddInternship} />
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
};

export default StudentPage;
