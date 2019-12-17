import React from 'react';
import classes from './Home.module.scss';
import { AppBar, Toolbar, IconButton, Typography, Container, Dialog, DialogTitle, DialogContent, DialogActions, Button, ListItem, List, DialogContentText, ListItemAvatar, Avatar, ListItemText, Divider } from '@material-ui/core';
import SETTINGS from '../../../Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Dashboard from '@material-ui/icons/Dashboard';
import { Link } from 'react-router-dom';
import { DividerMargin, Marger, notifyError, BigPreloader, getMonthText } from '../../../helpers';
import APIHELPER from '../../../APIHelper';
import EmbeddedError from '../../shared/EmbeddedError/EmbeddedError';
import Leaflet from 'leaflet';
import { FullContact } from '../../../interfaces';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

const HomePage: React.FC = () => {
  return (
    <div className={classes.root}>
      <AppBar position="relative" style={{ backgroundColor: '#e88724' }}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            promos@bioinfo Lyon
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

      <div className={classes.color_header}>
        <div className={classes.color_header_texts}>
          <Typography variant="h2">
            Suivi des promotions
          </Typography>

          <Typography variant="h4">
            Master Bio-Informatique de Lyon
          </Typography>
        </div>

        {(!!SETTINGS.logged || SETTINGS.login_pending) ?
          <Link className={classes.button_login} to="/dashboard/">
            <Button variant="outlined" color="primary">
              Tableau de bord
            </Button>
          </Link>
          : 
          <Link className={classes.button_login} to="/login/">
            <Button variant="outlined" color="primary">
              Connectez-vous
            </Button>
          </Link>
        }
      </div>

      <Container maxWidth="lg" className={classes.container}>
      
        <Typography variant="h4" className={classes.home_main_title} gutterBottom align="center">
          Bienvenue
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

        <CompanyMap />

        <DividerMargin size="1rem" />

        <div className={classes.mainlogoblock}>
          <a href="https://www.bioinfo-lyon.fr/" className={classes.mainlogolink1} target="_blank" rel="noopener noreferrer">
            <img src="/assets/bio-info.png" className={classes.mainlogo} alt="Logo master" />
          </a>
          <a href="/">
            <img src="/assets/promo-app.png" className={classes.mainlogo} alt="Logo application" />
          </a>
        </div>

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

interface MappedCompany {
  lat: string;
  lng: string;
  count: number;
  town: string;
}

function CompanyMap() {
  const [companies, setCompanies] = React.useState<MappedCompany[] | undefined | number>(undefined);
  const [modalOpen, setModalOpen] = React.useState<MappedCompany | false>(false);
  const [modalStudentOpen, setModalStudentOpen] = React.useState<MappedCompany | false>(false);

  React.useEffect(() => {
    const wait_prom = SETTINGS.login_promise ? SETTINGS.login_promise : Promise.resolve();
  
    wait_prom
      .then(() => APIHELPER.request('company/map'))
      .then(setCompanies)
      .catch(err => {
        if (Array.isArray(err) && APIHELPER.isApiError(err[1])) {
          setCompanies(err[1].code);
        }
      })
  }, []);

  if (typeof companies === 'number') {
    return <EmbeddedError error={companies} />;
  }

  // Companies is MappedCompany[]
  const default_view: Leaflet.LatLngExpression = [45.7578137, 4.8320114];

  return (
    <>
      {modalOpen && <ContactsOf company={modalOpen} onClose={() => setModalOpen(false)} />}
      {modalStudentOpen && <StudentsOf company={modalStudentOpen} onClose={() => setModalStudentOpen(false)} />}

      <Map center={default_view} zoom={6} style={{ height: '40vh', minHeight: '400px' }}>
        <TileLayer
          url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
          attribution="&copy; Wikipedia Maps | <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />

        {companies && companies.map(c => <Marker key={c.town} position={[Number(c.lat), Number(c.lng)]}>
          <Popup>
            <strong>{c.town}</strong>
            <br />

            <p>
              {c.count} emploi{c.count > 1 ? "s" : ""} ici.
            </p>

            {SETTINGS.logged ? <><a 
              href="#!" 
              className="link-blue" 
              onClick={() => setModalOpen(c)}
            >
              Voir les contacts disponibles ici
            </a><br /></> : ""}

            {SETTINGS.logged ? <a 
              href="#!" 
              className="link-blue" 
              onClick={() => setModalStudentOpen(c)}
            >
              Voir les étudiant•es ayant travaillé ici
            </a> : ""}
          </Popup>
        </Marker>)}
      </Map>
    </>
  );
}

interface SwallowStudentJobInfo {
  student: {
    name: string;
    surname: string;
    mail: string;
  };
  ended: boolean;
  related_date: string;
  type: 'internship' | 'job';
  company: string;
}

function StudentsOf(props: { company: MappedCompany, onClose: () => void }) {
  const [infos, setInfos] = React.useState<SwallowStudentJobInfo[] | null | undefined>(undefined);

  React.useEffect(() => {
    setInfos(null);
    if (infos === undefined) {
      APIHELPER.request('student/in', { 
        parameters: { 
          town: props.company.town
        } 
      })
        .then(setInfos)
        .catch(notifyError);
    }
  // eslint-disable-next-line
  }, [props]);

  if (!infos) {
    return (
      <Dialog open fullWidth onClose={props.onClose}>
        <DialogContent>
          <BigPreloader style={{ marginTop: '10px', marginBottom: '25px' }} />
        </DialogContent>
      </Dialog>
    );
  }

  const stages = infos
    .filter(i => i.type === 'internship')
    .sort((j1, j2) => j1.company > j2.company ? 1 : (j1.company === j2.company ? 0 : -1));
  const emplois = infos
    .filter(i => i.type === 'job')
    .sort((j1, j2) => j1.company > j2.company ? 1 : (j1.company === j2.company ? 0 : -1));
  
  return (
    <Dialog open scroll="body" fullWidth onClose={props.onClose}>
      <DialogTitle>Étudiant•es ayant travaillé à {props.company.town.split(',')[0]}</DialogTitle>

      <DialogContent>
        {infos.length === 0 && <div>
          <DialogContentText>Aucun•e étudiant•e n'a désiré partager ses coordonnées à cet emplacement.</DialogContentText>
        </div>}

        {!!infos.length && <>
          <DialogContentText style={{ marginBottom: 0 }}>
            {infos.length} étudiant•e{infos.length > 1 ? "s" : ""} {infos.length > 1 ? "ont" : "a"}{" "}
            partagé {infos.length > 1 ? "leurs" : "ses"} coordonnées.
          </DialogContentText>

          <Marger size="0.5rem" />

          {/* Emplois en cours */}
          {!!emplois.length && <div>
            <Typography variant="h6">
              Embauches
            </Typography>

            <ListForStudents students={emplois} />
          </div>}

          {/*  Stages */}
          {!!stages.length && <div>
            <Typography variant="h6">
              Stagiaires
            </Typography>

            <ListForStudents students={stages} />
          </div>}
        </>}
      </DialogContent>

      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ListForStudents(props: { students: SwallowStudentJobInfo[] }) {
  const infos = props.students;

  const companies: { [name: string]: SwallowStudentJobInfo[] } = {};

  for (const s of infos) {
    if (s.company in companies) {
      companies[s.company].push(s);
    }
    else {
      companies[s.company] = [s];
    }
  }

  const cp_len = Object.keys(companies).length;

  function dateForStudent(s: SwallowStudentJobInfo) {
    if (s.type === "internship") {
      return s.related_date;
    }
    else {
      if (s.ended) {
        const [year, month, ] = s.related_date.split('-');
        return `jusqu'en ${getMonthText(month)?.toLocaleLowerCase()} ${year}`;
      }
      else {
        const [year, month, ] = s.related_date.split('-');
        return `depuis ${getMonthText(month)?.toLocaleLowerCase()} ${year}`;
      }
    }
  }

  return (
    <List>
      {Object.entries(companies).map(([c, s], index) => <React.Fragment key={index}>
        <ListItem className="no-left" alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt={c}>
              {c.slice(0, 1)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            disableTypography
            primary={<Typography>
              {c}
            </Typography>}
            secondary={s.map((st, index) => <Typography 
              variant="body2" 
              color="textSecondary" 
              key={index} 
              className={classes.inline_company}
            >
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                {st.student.mail}
              </Typography>
              {" — "}{st.student.surname + " " + st.student.name}
              {" ("}{dateForStudent(st)}{")"}
            </Typography>)}
          />
        </ListItem>
        {index !== cp_len - 1 && <Divider variant="inset" component="li" />}
      </React.Fragment>)}
    </List>
  );
}

function ContactsOf(props: { company: MappedCompany, onClose: () => void }) {
  const [contacts, setContacts] = React.useState<FullContact[] | undefined>(undefined);

  React.useEffect(() => {
    APIHELPER.request('contact/in', { 
      parameters: { 
        town: props.company.town
      } 
    })
      .then(setContacts)
      .catch(notifyError)
  }, [props]);

  if (!contacts) {
    return (
      <Dialog open fullWidth onClose={props.onClose}>
        <DialogContent>
          <BigPreloader style={{ marginTop: '10px', marginBottom: '25px' }} />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open scroll="body" fullWidth onClose={props.onClose}>
      <DialogTitle>Contacts à {props.company.town.split(',')[0]}</DialogTitle>

      <DialogContent>
        {contacts.length === 0 && <div>
          <DialogContentText>Aucun contact n'est disponible à cet emplacement.</DialogContentText>
        </div>}

        {!!contacts.length && <>
          <DialogContentText style={{ marginBottom: 0 }}>
            {contacts.length} contact{contacts.length > 1 ? "s" : ""} disponible{contacts.length > 1 ? "s" : ""}.
          </DialogContentText>

          <List>
            {contacts.map((c, index) => <React.Fragment key={c.id}>
              <ListItem className="no-left" alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar alt={c.name}>
                    {c.name.slice(0, 1)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={c.name}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        className={classes.inline}
                        color="textPrimary"
                      >
                        {c.email}
                      </Typography>
                      {" — "}{c.linked_to.name}
                    </>
                  }
                />
              </ListItem>
              {index !== contacts.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>)}
          </List>
        </>}
      </DialogContent>

      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
