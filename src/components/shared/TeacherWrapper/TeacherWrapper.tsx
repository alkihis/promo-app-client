import React from 'react';
import classes from './TeacherWrapper.module.scss';

// TODO should block if user is not logged / not a teacher, or show props.children instead
export default class TeacherWrapper extends React.Component {
  render() {
    // TODO check teacher
    if (false) {}

    return this.props.children;
  }
}
