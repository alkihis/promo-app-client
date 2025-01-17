import React from 'react';
import { BrowserRouter as Router, Route, Switch, RouteComponentProps } from "react-router-dom";
import NotFound from '../pages/NotFound/NotFound';
import HomePage from '../pages/Home/Home';
import TeacherPage from '../pages/Teacher/Dashboard/Dashboard';
import {StudentSelfHome, StudentWrapper} from "../pages/Student/Dashboard/Dashboard";
import TeacherWrapper from '../shared/TeacherWrapper/TeacherWrapper';
import TeacherStudentWrapper from '../pages/Teacher/StudentWrapper/TeacherStudentWrapper';
import SignIn from '../pages/Login/Login';
import LostToken from '../pages/LostToken/LostToken';
import DashboardWrapper from '../shared/DashboardWrapper/DashboardWrapper';
import AskCreationStudent from '../pages/AskCreation/AskCreation';

const AppRouter = () => {
  return (
    <Router>
      <Switch>
        {/** Autoredirect for dashboard (teacher & student) */}
        <Route path="/dashboard/" exact component={DashboardWrapper} />

        {/** Account creation */}
        <Route path="/profile_create" exact component={AskCreationStudent} /> 

        {/** 
          Show student information 
          Should be same page as /student, but with a selected specific student
          and more options (data that are not modifiable for students)
        */}
        <Route path={`/teacher/dashboard/:id/`} render={
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

          Everything modifiable should be in a modal. (re-use for /teacher/dashboard/:id)
          */}
        <Route path="/student/" render={
          (props: RouteComponentProps) => <StudentWrapper component={StudentSelfHome} {...props} />
        } />  

        {/** 
          Home page: Show statistics, map for companies.
          */}
        <Route path="/" exact component={HomePage} />

        <Route path="/login/" component={SignIn} />

        <Route path="/mail_login/" component={LostToken} />

        {/* Not Found page. */}
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default AppRouter;
