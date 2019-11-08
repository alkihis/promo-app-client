import React from 'react';
import classes from './TeacherStudentWrapper.module.scss';
import { useParams, RouteComponentProps } from 'react-router-dom';
import StudentPage from '../StudentHome/StudentHome';
import { Student } from '../../../interfaces';
import { BigPreloader } from '../../../helpers';
import APIHELPER from '../../../APIHelper';

const TeacherStudentWrapper: React.FC<RouteComponentProps> = props => {
  const { id: student_id } = useParams();
  // null in loading, undefined erreur réseau, number error code, student si réussi
  const [student, setStudent] = React.useState<Student | number | null | undefined>(null);

  const int_id = Number(student_id);

  // TODO error msg
  if (!int_id || isNaN(int_id)) {
    return <div>Invalid student ID</div>;
  }

  if (student === null) {
    // fetch !
    APIHELPER.request('student/' + student_id)
      .then((student: Student) => {
        setStudent(student);
      })
      .catch(e => {
        if (Array.isArray(e) && APIHELPER.isApiError(e[1])) {
          setStudent(e[1].code);
        }
        else {
          setStudent(undefined);
        }
      })
  }

  // TODO Component for error messages !!!!!
  if (student && typeof student !== 'number')
    return <StudentPage {...props} student={student} />;
  else if (typeof student === 'number')
    return <div>Erreur code {student}</div>;
  else if (student === undefined)
    return <div>Erreur réseau</div>;
  else
    return <BigPreloader style={{ height: '100vh' }} />;
}

export default TeacherStudentWrapper;
