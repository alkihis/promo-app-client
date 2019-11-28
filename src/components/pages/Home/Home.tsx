import React from 'react';
import classes from './Home.module.scss';
import { AppBar, Toolbar, IconButton, Typography, Container, Dialog, DialogTitle, DialogContent, DialogActions, Button, ListItem, List, DialogContentText, ListItemAvatar, Avatar, ListItemText, Divider } from '@material-ui/core';
import SETTINGS from '../../../Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Dashboard from '@material-ui/icons/Dashboard';
import { Link } from 'react-router-dom';
import { DividerMargin, Marger, notifyError, BigPreloader } from '../../../helpers';
import APIHELPER from '../../../APIHelper';
import EmbeddedError from '../../shared/EmbeddedError/EmbeddedError';
import Leaflet from 'leaflet';
import { FullContact } from '../../../interfaces';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

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

        <CompanyMap />

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

interface MappedCompany {
  lat: string;
  lng: string;
  count: number;
  town: string;
}

function CompanyMap() {
  const [companies, setCompanies] = React.useState<MappedCompany[] | undefined | number>(undefined);
  const [modalOpen, setModalOpen] = React.useState<MappedCompany | false>(false);

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

            {SETTINGS.logged ? <a 
              href="#!" 
              className="link-blue" 
              onClick={() => setModalOpen(c)}
            >
              Voir les contacts disponibles ici
            </a> : ""}
          </Popup>
        </Marker>)}
      </Map>
    </>
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
              <ListItem alignItems="flex-start">
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
