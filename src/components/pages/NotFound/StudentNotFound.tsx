import React from "react";
import {RouteComponentProps} from "react-router-dom";
import EmbeddedError from "../../shared/EmbeddedError/EmbeddedError";

const StudentNotFound: React.FC<RouteComponentProps> = () => {
  // const context: Student = useContext(StudentContext);

  return <EmbeddedError text="Page non trouvée." />;
};

export default StudentNotFound;
