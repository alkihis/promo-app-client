import React from 'react';
import LoginWrapper, { GenericLoginWrapperProps } from '../LoginWrapper/LoginWrapper';

const TeacherWrapper: React.FC<GenericLoginWrapperProps> = props => {
  return <LoginWrapper allowOn="teacher" {...props} />;
};

export default TeacherWrapper;
