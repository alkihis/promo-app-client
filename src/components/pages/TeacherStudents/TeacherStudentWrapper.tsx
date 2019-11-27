import React from 'react';
import { useParams, RouteComponentProps } from 'react-router-dom';
import StudentPage from '../StudentHome/StudentHome';
import { Student } from '../../../interfaces';
import { BigPreloader } from '../../../helpers';
import APIHELPER from '../../../APIHelper';
import { FullError } from '../../shared/EmbeddedError/EmbeddedError';

const TeacherStudentWrapper: React.FC<RouteComponentProps> = props => {
  const { id: student_id } = useParams();
  // null in loading, undefined erreur réseau, number error code, student si réussi
  const [student, setStudent] = React.useState<Student | number | null | undefined>(null);

  const int_id = Number(student_id);

  // TODO error msg
  if (!int_id || isNaN(int_id)) {
    return <FullError
      text="L'identifiant de l'étudiant est invalide."
      button={{
        link: "/teacher/student/all",
        text: "Retour aux étudiants"
      }}
    />;
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

  // typeof student === 'object' and student !== null
  if (student && typeof student !== 'number')
    return <StudentPage {...props} student={student} />;
  else if (typeof student === 'number')
    return <FullError
      error={student}
      button={{
        link: "/teacher/student/all",
        text: "Retour aux étudiants"
      }}
    />;
  else if (student === undefined)
    return <FullError
      text="Erreur réseau."
      button={{
        link: "/teacher/student/all",
        text: "Retour aux étudiants"
      }}
    />;
  else
    return <BigPreloader style={{ height: '100vh' }} />;
};

export default TeacherStudentWrapper;
