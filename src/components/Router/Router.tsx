import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, RouteComponentProps } from "react-router-dom";
import NotFound from '../pages/NotFound/NotFound';
import HomePage from '../pages/Home/Home';
import TeacherPage from '../pages/TeacherHome/Teacher';
import RouterWrapper from './RouterWrapper';
import StudentPage from '../pages/StudentHome/StudentHome';
import SendMail from '../pages/SendMail/SendMail';
import TeacherStudents from '../pages/TeacherStudents/TeacherStudents';
import TeacherStudentWrapper from '../pages/TeacherStudents/TeacherStudentWrapper';
import AddStudent from '../pages/AddStudent/AddStudent';

export default class AppRouter extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          {/** Show students 
            All data for student, selector for student (sort information, deletion...)
           */}
          <Route path="/teacher/student/all" component={TeacherStudents} />

          {/** Add a new student (enter basic informations about him/her). */}
          <Route path="/teacher/student/add" component={AddStudent} />

          {/** Show student information 
            Should be same page as /student, but with a selected specific student
            and more options (data that are not modifiable for students)
           */}
          <Route path="/teacher/student/:id" component={TeacherStudentWrapper} />

          {/** Show teacher mailing page: Send group mail for students */}
          <Route path="/teacher/mail" component={SendMail} /> 

          {/** Show teacher home page
            Dashboard with stats (maybe), available students,
            map for companies, group mailing...
           */}
          <Route path="/teacher/" component={TeacherPage} />  

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
