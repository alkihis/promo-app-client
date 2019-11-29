import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import MailIcon from '@material-ui/icons/Mail';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { RouteComponentProps, Link as RouterLink } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { errorToText } from '../../../helpers';
import APIHELPER from '../../../APIHelper';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link color="inherit" style={{textDecoration: 'underline'}} href="#" component={RouterLink} to="/">
        Retourner à l'acceuil
      </Link>
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spaper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  trans: {
    transition: '.6s'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: '#4875da',
  },
  avatarOk: {
    margin: theme.spacing(1),
    backgroundColor: green[500],
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  etu_text: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  bottom_text: {
    fontSize: '.8rem',
    marginBottom: theme.spacing(1),
  },
  error_msg: {
    color: theme.palette.secondary.main,
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    color: theme.palette.secondary.main,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -13,
  },
  classicLink: {
    textDecoration: 'none',
  },
}));

// boolean: false pour pas encore en charge / true: validé (jamais censé être affiché)
// null: en chargement
// number: Code d'erreur API
// undefined: Erreur inconnue (réseau par exemple)
type LoggedStatus = boolean | null | undefined | number;

const LostToken: React.FC<RouteComponentProps> = props => {
  const classes = useStyles();

  const [status, setStatus] = React.useState<LoggedStatus>(false);

  function resetCmpt() {
    (document.getElementById('login-auto-identifier')! as HTMLInputElement).value = "";
    setStatus(false);
  }

  function startRecover() {
    const field = document.getElementById('login-auto-identifier')! as HTMLInputElement;
    
    setStatus(null);

    // TODO recover call
    APIHELPER.request('token/recover', { parameters: { email: field.value } })
      .then(() => setStatus(true))
      .catch(e => {
        if (Array.isArray(e) && APIHELPER.isApiError(e[1])) {
          setStatus(e[1].code);
        }
        setStatus(undefined);
      });
  }

  function recoverAccount(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    evt.stopPropagation();

    if (status === null || status === true) {
      return;
    }

    startRecover();
  }

  return (
    <Container className="center" component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.trans + " " + (status === true ? classes.avatarOk : classes.avatar)}>
          <MailIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Connexion à votre compte
        </Typography>
      </div>

      <div className={classes.spaper}>
        <Typography className={classes.etu_text}>
          {status !== true ? 
            "Spécifiez l'adresse e-mail sur laquelle votre compte est enregistré. \
            Un e-mail contenant votre lien de connexion vous sera envoyé." : 
            "L'e-mail a été envoyé avec succès. Vérifiez votre boîte mail."
          }
        </Typography>

        {status === undefined || typeof status === 'number' ? 
          <div className={classes.error_msg}>{errorToText(status)}</div> : 
          ""
        }

        <form className={classes.form} onSubmit={recoverAccount}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            required
            id="login-auto-identifier"
            label="Adresse e-mail"
            name="auto-id"
            type="email"
            autoFocus
          />
          <div className={classes.wrapper}>
            <Button
              type="submit"
              fullWidth
              variant="outlined"
              color="primary"
              disabled={status === null || status === true}
              className={classes.submit}
            >
              Envoyer une clé d'accès
            </Button>
            {status === null && <CircularProgress size={26} className={classes.buttonProgress} />}
          </div>
        </form>
        
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default LostToken;
