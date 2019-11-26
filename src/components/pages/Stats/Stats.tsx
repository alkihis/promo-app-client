import React from 'react';
import { DashboardContainer } from '../../shared/Dashboard/Dashboard';
import { Typography } from '@material-ui/core';

export default class TeacherStats extends React.Component {
  render() {
    return (
      <DashboardContainer>
        <Typography variant="h3" className="bold">
          Statistiques
        </Typography>
      </DashboardContainer>
    );
  }
}
