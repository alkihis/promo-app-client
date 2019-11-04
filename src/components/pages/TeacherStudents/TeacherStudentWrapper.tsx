import React from 'react';
import classes from './TeacherStudentWrapper.module.scss';
import { useParams } from 'react-router-dom';

// TODO wrap a StudentDashboard for id given in route params
const TeacherStudentWrapper: React.FC = () => {
  const { id: student_id } = useParams();

  return (
    <div>
      Getting student {student_id}
    </div>
  );
}

export default TeacherStudentWrapper;
