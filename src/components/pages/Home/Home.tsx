import React from 'react';
import classes from './Home.module.scss';
import { AppBar, Toolbar, IconButton, Typography, Container } from '@material-ui/core';
import SETTINGS, { LoggedLevel } from '../../../Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Dashboard from '@material-ui/icons/Dashboard';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className={classes.root}>
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Accueil
          </Typography>
          {(!!SETTINGS.logged || SETTINGS.login_pending) ?
            <div>
              <Link className="link" to="/dashboard/">
                <IconButton
                  color="inherit"
                >
                  <Dashboard />
                </IconButton>
              </Link>
            </div>
          : 
            <div>
              <Link className="link" to="/login">
                <IconButton
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Link>
            </div>
          }
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className={classes.container}>
        <Typography variant="h3" className={classes.home_title} gutterBottom>
          Master bioinfo@lyon
        </Typography>

        <Typography variant="h5" className={classes.home_title} gutterBottom>
          Suivi des promotions
        </Typography>
        
        <Typography>
          Cet outil est conçu pour suivre les étudiants ayant suivi le Master
          de Bio-Informatique à l'Université Claude Bernard Lyon 1.
          <br />
          Il vous permet également de trouver des entreprises et contacts pour
          vos recherches de stage ou d'emploi.
        </Typography>

        <img src="/assets/bio-info.png" className={classes.bioinfologo} />
      </Container>
    </div>
  );
};

export default HomePage;
