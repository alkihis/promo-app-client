//// NOT FOUND Page
import React from "react";
import {RouteComponentProps} from "react-router-dom";
import EmbeddedError from "../../shared/EmbeddedError/EmbeddedError";

const TeacherNotFound: React.FC<RouteComponentProps> = props => {
  return <EmbeddedError text={`Page non trouvée (${props.location.pathname})`} />;
};

export default TeacherNotFound;
