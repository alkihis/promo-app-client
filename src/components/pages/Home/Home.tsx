import React from 'react';
import classes from './Home.module.scss';
import { AppBar, Toolbar, IconButton, Typography, Container, Dialog, DialogTitle, DialogContent, DialogActions, Button, ListItem, List, DialogContentText } from '@material-ui/core';
import SETTINGS from '../../../Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Dashboard from '@material-ui/icons/Dashboard';
import { Link } from 'react-router-dom';
import { DividerMargin, Marger, notifyError, BigPreloader } from '../../../helpers';
import APIHELPER from '../../../APIHelper';
import EmbeddedError from '../../shared/EmbeddedError/EmbeddedError';
import Leaflet from 'leaflet';
import { Contact, FullContact } from '../../../interfaces';

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

  function generatePopupElement(company: MappedCompany) {
    const el = document.createElement('div');
    const company_name = document.createElement('strong');
    company_name.textContent = company.town;
    el.appendChild(company_name);

    el.appendChild(document.createElement('br'));

    const informations = document.createElement('p');
    informations.textContent = `${company.count} emploi${company.count > 1 ? "s" : ""} ici.`;
    el.appendChild(informations);

    if (SETTINGS.logged) {
      const more = document.createElement('a');
      more.className = "link-blue";
      more.href = "#!";
      more.textContent = "Voir les contacts disponibles ici";
      more.onclick = () => setModalOpen(company);
      el.appendChild(more);
    }

    return el;
  }

  React.useEffect(() => {
    setTimeout(() => {
      const wait_prom = SETTINGS.login_promise ? SETTINGS.login_promise : Promise.resolve();
  
      wait_prom
        .then(() => APIHELPER.request('company/map'))
        .then(setCompanies)
        .catch(err => {
          if (Array.isArray(err) && APIHELPER.isApiError(err[1])) {
            setCompanies(err[1].code);
          }
        })
    }, 15);
  }, []);

  React.useEffect(() => {
    if (companies && typeof companies === 'object') {
      // Companies is MappedCompany[]
      const default_view: Leaflet.LatLngExpression = companies.length ? [Number(companies[0].lat), Number(companies[0].lng)] : [51.505, -0.09];

      const my_map = Leaflet.map('company-map').setView(default_view, 8);

      Leaflet.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; Wikipedia Maps | <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(my_map);

      for (const company of companies) {
        Leaflet
          .marker([Number(company.lat), Number(company.lng)])
          .addTo(my_map)
          .bindPopup(generatePopupElement(company));
      }
    }
  }, [companies])

  if (companies === undefined) {
    return <></>;
  }
  else if (typeof companies === 'number') {
    return <EmbeddedError error={companies} />;
  }

  return (
    <>
      {modalOpen && <ContactsOf company={modalOpen} onClose={() => setModalOpen(false)} />}
      <div id="company-map" style={{ height: '40vh' }} />
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
  }, []);

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
    <Dialog open fullWidth onClose={props.onClose}>
      <DialogTitle>Contacts à {props.company.town.split(',')[0]}</DialogTitle>

      <DialogContent>
        {contacts.length === 0 && <div>
          <DialogContentText>Aucun contact n'est disponible à cet emplacement.</DialogContentText>
        </div>}

        {!!contacts.length && <>
          <DialogContentText>{contacts.length} contact{contacts.length > 1 ? "s" : ""} disponible.</DialogContentText>

          <List>
            {contacts.map(c => <ListItem key={c.id}>
              {c.name} {c.email} dans l'entreprise {c.linked_to.name}
            </ListItem>)}
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

