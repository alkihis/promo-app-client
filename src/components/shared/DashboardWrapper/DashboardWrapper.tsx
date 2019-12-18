import React from 'react';
import LoginWrapper from '../LoginWrapper/LoginWrapper';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import SETTINGS, { LoggedLevel } from '../../../utils/Settings';

// Automatic redirect to teacher dashboard or student dashboard
const DashboardWrapper: React.FC<RouteComponentProps> = props => {
  return (
    <LoginWrapper 
      allowOn={["teacher", "student"]}
      component={
        (_: RouteComponentProps) => SETTINGS.logged === LoggedLevel.logged ? 
          <RedirectToStudent /> :
          <RedirectToTeacher />
      }
      {...props}
    />
  );
};

const RedirectToTeacher: React.FC = () => <Redirect to="/teacher/" />;
const RedirectToStudent: React.FC = () => <Redirect to="/student/" />;

export default DashboardWrapper;
