import React from 'react';
import classes from './TeacherWrapper.module.scss';
import { RouteComponentProps } from 'react-router-dom';
import LoginWrapper, { GenericLoginWrapperProps } from '../LoginWrapper/LoginWrapper';

const TeacherWrapper: React.FC<GenericLoginWrapperProps> = props => {
  return <LoginWrapper allowOn="teacher" {...props} />;
}

export default TeacherWrapper;
