import React from 'react';
import classes from './Home.module.scss';
import { AppBar, Toolbar, IconButton, Typography, Container } from '@material-ui/core';
import SETTINGS from '../../../Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Dashboard from '@material-ui/icons/Dashboard';
import { Link } from 'react-router-dom';
import { DividerMargin, Marger } from '../../../helpers';

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
              <Link className="link" to="/login/">
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
        <Typography variant="h3" className={classes.home_title_main} gutterBottom>
          Master bioinfo@lyon
        </Typography>

        <Typography variant="h5" className={classes.home_title} gutterBottom>
          Suivi des promotions
        </Typography>
        
        <Typography gutterBottom>
          Cet outil est conçu pour suivre les étudiants ayant suivi le Master
          de Bio-Informatique à l'Université Claude Bernard Lyon 1.
          <br />
          Il vous permet de rensigner les différents stages que vous avez effectué pendant
          votre formation, puis les emplois occupés après votre diplôme.
          Si vous avez suivi une autre formation à la suite de votre master, vous serez
          également capable de nous en informer.
        </Typography>

        <Typography variant="h5" className={classes.home_title} gutterBottom>
          Contacts et lieux d'intérêt
        </Typography>
        
        <Typography gutterBottom>
          Vous pouvez explorer les différentes entreprises ou laboratoires ayant recruté 
          les bio-informaticiens de ce master pendant ou à la suite de leurs études.
          <br />
          Il vous permet également de trouver des contacts pour
          vos recherches de stage ou d'emploi.
        </Typography>
        
        <DividerMargin size="1rem" />
        
        <a href="https://www.bioinfo-lyon.fr/" target="_blank" rel="noopener noreferrer">
          <img src="/assets/bio-info.png" className={classes.mainlogo} alt="Logo master" />
        </a>

        <Marger size=".2rem" />
        
        <div className={classes.responsive_img_container}>
          <a href="http://lbbe.univ-lyon1.fr/" target="_blank" rel="noopener noreferrer">
            <img src="/assets/lbbe.jpg" className={classes.bioinfologo} alt="Logo LBBE" />
          </a>
         
          <a href="https://liris.cnrs.fr/" target="_blank" rel="noopener noreferrer">
            <img src="/assets/liris.png" className={classes.bioinfologo} alt="Logo LIRIS" />
          </a>

          <a href="http://www.ibcp.fr/" target="_blank" rel="noopener noreferrer">
            <img src="/assets/ibcp.png" className={classes.bioinfologo} alt="Logo IBCP" />
          </a>
        </div>
      </Container>
      
      <Marger size="2rem" />
    </div>
  );
};

export default HomePage;
