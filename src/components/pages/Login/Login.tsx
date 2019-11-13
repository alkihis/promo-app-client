import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import CheckIcon from '@material-ui/icons/Check';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { RouteComponentProps, Link as RouterLink } from 'react-router-dom';
import QueryString from 'query-string';
import { CircularProgress } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import SETTINGS, { LoggedLevel } from '../../../Settings';
import LoginWrapper from '../../shared/LoginWrapper/LoginWrapper';

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
    backgroundColor: theme.palette.secondary.main,
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
  wrapperPaper: {
    transition: theme.transitions.create(['opacity'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
    opacity: 1,
  },
  wrapperPaperOk: {
    opacity: 0,
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

const SignInSwitch: React.FC<RouteComponentProps> = props => {
  return (
    <LoginWrapper 
      allowOn={["none", "error"]} 
      component={SignIn} 
      onInvalidCredentials={AlreadyLogged}
      {...props} 
    />
  );
};

const SignIn: React.FC<RouteComponentProps> = props => {
  const classes = useStyles();

  const query_string = props.location.search;
  let is_teacher = false;
  let input_value = "";

  const [status, setStatus] = React.useState<LoggedStatus>(false);

  if (query_string) {
    const parsed = QueryString.parse(query_string);
    
    if (parsed.teacher === "1") {
      is_teacher = true;
    }
    if (!is_teacher && parsed.token && status === false) {
      input_value = parsed.token as string;

      setTimeout(() => {
        const text_element = document.getElementById('login-auto-identifier') as HTMLInputElement;
        if (text_element) {
          text_element.value = input_value;
        }

        // Auto verify
        startLogin();
      }, 5);
    }
  }

  function resetCmpt() {
    (document.getElementById('login-auto-identifier')! as HTMLInputElement).value = "";
    setStatus(false);
  }

  function startLogin() {
    const field = document.getElementById('login-auto-identifier')! as HTMLInputElement;
    
    const login_promise = SETTINGS.loginAs(field.value, is_teacher);
    setStatus(null);

    login_promise
      .then(() => {
        // Logged !
        setStatus(true);

        setTimeout(() => {
          window.location.pathname = is_teacher ? "/teacher/" : "/student/";
        }, 1000);
      })
      .catch((cause: number | undefined) => {
        setStatus(cause);
      });
  }

  function login(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    evt.stopPropagation();

    if (status === null || status === true) {
      return;
    }

    startLogin();
  }

  return (
    <Container className="center" component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.trans + " " + (status === true ? classes.avatarOk : classes.avatar)}>
          {status === true ? <CheckIcon /> : <LockOutlinedIcon />}
        </Avatar>
        <Typography component="h1" variant="h5">
          {status === true ? "Connecté" : "Se connecter"}
        </Typography>
      </div>

      <div className={classes.spaper + " " + classes.wrapperPaper + " " + (status === true ? classes.wrapperPaperOk : "")}>
        {!is_teacher && <Typography className={classes.etu_text}>
          Si vous êtes inscrit à ce service, vous devriez avoir reçu un
          e-mail permettant de vous connecter automatiquement.

          Si vous l'avez perdu, mais que vous disposez toujours de votre clé d'accès
          unique, vous pouvez la spécifier ici.
        </Typography>}

        {status === undefined || typeof status === 'number' ? 
          <div className={classes.error_msg}><ErrorMessage code={status} /></div> : 
          ""
        }

        <form className={classes.form} onSubmit={login}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            required
            id="login-auto-identifier"
            label={is_teacher ? "Mot de passe enseignant" : "Clé d'accès"}
            name="auto-id"
            type={is_teacher ? "password" : "text"}
            autoFocus
          />
          <div className={classes.wrapper}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={status === null || status === true}
              className={classes.submit}
            >
              Connexion
            </Button>
            {status === null && <CircularProgress size={26} className={classes.buttonProgress} />}
          </div>
          
          <Typography color="textSecondary" className={classes.bottom_text + " center"}>
            La connexion sera persistente.
          </Typography>

          {status !== null && status !== true && <Grid container justify="space-between">
            <Grid item>
              <Link 
                href="#" 
                variant="body2" 
                to={"/login?teacher=" + (!is_teacher ? "1" : "0")} 
                component={RouterLink}
                onClick={resetCmpt}
              >
                Connexion {!is_teacher ? "enseignante" : "étudiante"}
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2" to="/lost_token/" component={RouterLink}>
                {!is_teacher ? "Clé d'accès" : "Mot de passe"} perdu{!is_teacher ? "e" : ""} ?
              </Link>
            </Grid>
          </Grid>}
        </form>
        
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

function ErrorMessage(props: { code: number | undefined }) {
  if (!props.code) {
    return <span>Erreur réseau. Impossible de joindre le serveur.</span>;
  }

  switch (props.code) {
    case 4:
      return <span>Erreur serveur. Veuillez réessayer ultérieurement.</span>;

    case 5:
      return <span>Le mot de passe saisi est invalide.</span>;

    case 6:
      return <span>La clé d'accès n'est pas reconnue.</span>;

    case 2:
      return <span>Ressource non trouvée.</span>;

    case 8:
      return <span>Vous n'avez pas les autorisations nécessaires</span>;

    default:
      return <span>Erreur inconnue. Réessayez utltérieurement.</span>;
  }
}

function AlreadyLogged() {
  const classes = useStyles();

  return (
    <Container className="center" component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Déjà connecté
        </Typography>

        <div className={classes.etu_text}>
          <Typography>
            Vous êtes déjà connecté au service.
          </Typography>

          <div className={classes.etu_text}>
            {SETTINGS.logged === LoggedLevel.logged && <RouterLink className={classes.classicLink} to="/student/">
              <Button color="primary">
                Aller au tableau de bord
              </Button>
            </RouterLink>}

            {SETTINGS.logged === LoggedLevel.teacher && <RouterLink className={classes.classicLink} to="/teacher/">
              <Button color="primary">
                Aller au tableau de bord
              </Button>
            </RouterLink>}
            
            <Button onClick={() => { SETTINGS.unlog(); window.location.reload(); }} color="secondary">
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default SignInSwitch;
