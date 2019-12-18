//// HOME Page
import React from "react";
import APIHELPER from "../../../../utils/APIHelper";
import {BigPreloader, DividerMargin, notifyError} from "../../../../utils/helpers";
import {DashboardContainer} from "../../../shared/Dashboard/Dashboard";
import {Typography} from "@material-ui/core";

interface HomeStats {
  companies_with_work: number;
  graduated: number;
  in_formation: number;
  students: number;
  students_currently_working: number;
  thesis: number;
}

const TeacherHomePage: React.FC = () => {
  const [stats, setStats] = React.useState<HomeStats | undefined>(undefined);

  React.useEffect(() => {
    APIHELPER.request('teacher/home_stats')
      .then(setStats)
      .catch(notifyError);
  }, []);

  function show(n: number) {
    return n === 0 ? "Aucun" : String(n);
  }

  function s(n: number) {
    return n > 1 ? "s" : "";
  }

  function ontOrA(n: number) {
    return n > 1 ? "ont" : "a";
  }

  if (!stats) {
    return <BigPreloader style={{ marginTop: '2rem' }} />;
  }

  return (
    <DashboardContainer>
      <Typography variant="h3" gutterBottom className="bold">
        Bienvenue.
      </Typography>

      <Typography variant="h6">
        {show(stats.students)} étudiant{s(stats.students)} enregistrés
      </Typography>

      <Typography color="textSecondary">
        {show(stats.in_formation)} en formation, {show(stats.graduated)} diplômé{s(stats.graduated)}.
      </Typography>

      <DividerMargin size=".7rem" />

      <Typography variant="h6">
        {show(stats.students_currently_working)} étudiant{s(stats.students_currently_working)} {ontOrA(stats.students_currently_working)} un emploi
      </Typography>

      <Typography color="textSecondary">
        {show(stats.thesis)} en thèse, {show(stats.companies_with_work)} entreprise{s(stats.companies_with_work)} embauchant actuellement.
      </Typography>
    </DashboardContainer>
  );
};

export default TeacherHomePage;
