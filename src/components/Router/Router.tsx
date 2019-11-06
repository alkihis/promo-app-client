import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, RouteComponentProps } from "react-router-dom";
import NotFound from '../pages/NotFound/NotFound';
import HomePage from '../pages/Home/Home';
import TeacherPage from '../pages/TeacherHome/Teacher';
import RouterWrapper from './RouterWrapper';
import StudentPage from '../pages/StudentHome/StudentHome';
import TeacherWrapper from '../shared/TeacherWrapper/TeacherWrapper';
import TeacherStudentWrapper from '../pages/TeacherStudents/TeacherStudentWrapper';

export default class AppRouter extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          {/** 
            Show student information 
            Should be same page as /student, but with a selected specific student
            and more options (data that are not modifiable for students)
          */}
          <Route path={`/teacher/dashboard/:id`} render={
            (props: RouteComponentProps) => <TeacherWrapper component={TeacherStudentWrapper} {...props} />
          } />

          {/** Show teacher home page
            Dashboard with stats (maybe), available students,
            map for companies, group mailing...
           */}
          <Route path="/teacher/" render={
            (props: RouteComponentProps) => <TeacherWrapper component={TeacherPage} {...props} />
          } />  

          {/** 
            Student page (for student)
            Dashboard for current logged user.

            Everything modifiable should be in a modal. (re-use for /teacher/student/:id)
           */}
          <Route path="/student/" component={StudentPage} />  

          {/** 
            Home page: Show statistics, map for companies.
           */}
          <Route path="/" exact component={HomePage} />

          {/* Not Found page. */}
          <Route component={NotFound} />
        </Switch>
        <RouterWrapper />
      </Router>
    );
  }
}
