import React from 'react';
import classes from './Teacher.module.scss';
import Dashboard from '../../shared/Dashboard/Dashboard';
import SETTINGS from '../../../Settings';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import TeacherStudents from '../TeacherStudents/TeacherStudents';
import AddStudent from '../AddStudent/AddStudent';
import SendMail from '../SendMail/SendMail';

// Teacher router
const TeacherPage: React.FC<RouteComponentProps> = ({ match }) => {
  const drawer = (
    <div>
      
    </div>
  );

  return (
    <Dashboard>
      <Switch>
        {/** 
          Show students 
          All data for student, selector for student (sort information, deletion...)
        */}
        <Route path={`${match.path}student/all`} component={TeacherStudents} />

        {/** Add a new student (enter basic informations about him/her). */}
        <Route path={`${match.path}student/add`} component={AddStudent} />

        {/** Show teacher mailing page: Send group mail for students */}
        <Route path={`${match.path}mail`} component={SendMail} /> 

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
        Hello, i'm the teacher dashboard {String(SETTINGS.test.baba())}
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
