import React from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Button, Typography, createStyles, makeStyles, List, ListItem, ListItemText, Divider, TextField, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip } from '@material-ui/core';
import { Student } from '../../../interfaces';
import { TransitionModal, notifyError } from '../../../helpers';
import CloseIcon from '@material-ui/icons/Close';
import { toast } from '../../shared/Toaster/Toaster';
import APIHELPER from '../../../APIHelper';
import MoreIcon from '@material-ui/icons/MoreHoriz';

const useStyles = makeStyles(theme =>
  createStyles({
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    container: {

    },
    textField: {
      margin: 'auto',
      display: 'block',
      width: '100%',
    },
    lockModal: {
      userSelect: 'none',
      pointerEvents: 'none',
    }
  }),
);

const ModalSendEmail: React.FC<{ open: boolean, onClose?: () => void, mails: Student[] }> = props => {
  const classes = useStyles();
  const [value, setValue] = React.useState("");
  const [obj, setObject] = React.useState("");
  const [willsend, setWillsend] = React.useState(false);
  const [insend, setInsend] = React.useState(false);
  const [selected, setSelected] = React.useState(props.mails);

  function closeWillsend() {
    setWillsend(false);
  }

  function openWillsend() {
    if (!obj) {
      toast("Cet e-mail n'a aucun objet.", 'error');
      return;
    }

    setWillsend(true);
  }

  function handleSelectedChange(newly: Student[]) {
    setSelected(newly);

    if (newly.length === 0) {
      props.onClose?.();
    }
  }

  function startSend() {
    setInsend(true);

    // Send the mail..
    APIHELPER.request('student/mail', {
      method: 'POST',
      parameters: {
        to: selected.map(e => e.email),
        object: obj,
        content: value,
      }
    })
      .then(() => {
        setWillsend(false);
        setInsend(false);
        toast("L'e-mail a été envoyé.", "success");
        props.onClose?.();
      })
      .catch(err => {
        notifyError(err);
        setWillsend(false);
        setInsend(false);
      });
  }

  function handleAddTagClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    e.preventDefault();

    const t = document.getElementById('content-email-textarea') as HTMLTextAreaElement;

    const pos = t.selectionStart;
    const data_tags = (e.currentTarget as HTMLElement).dataset;

    let injector = "{{ " + data_tags.tag + " ";
    let new_pos = pos + injector.length;

    if (data_tags.hasMember === "true") {
      if (data_tags.hasQuotes) {
        if (data_tags.hasQuotes === "1") {
          // Quotes are for first arg
          injector += '""';
          new_pos++;
        }
        else {
          // Quotes are for second arg
          injector += ' ""';
        }
      }
      injector += " }}";
    }
    else {
      injector += "}}";
      new_pos = pos + injector.length;
    }

    const new_val = t.value.slice(0, t.selectionStart) + injector + t.value.slice(t.selectionStart);
    setValue(new_val);

    t.focus();
    
    setTimeout(() => {
      t.setSelectionRange(new_pos, new_pos);  
    }, 20);
  }

  return (
    <>
      <Dialog 
        fullScreen 
        open={props.open} 
        onClose={props.onClose} 
        TransitionComponent={TransitionModal}
        className={insend ? classes.lockModal : undefined}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={props.onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              E-mail
            </Typography>
            <Button autoFocus color="inherit" onClick={openWillsend}>
              Envoyer
            </Button>
          </Toolbar>
        </AppBar>
        <div className={classes.container}>
          <List>
            <ListItem>
              <SenderMails 
                mails={selected} 
                onDelete={handleSelectedChange}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <TextField
                label="Objet"
                value={obj}
                onChange={elt => setObject(elt.target.value)}
                className={classes.textField}
                InputProps={{ style: { width: '100%' } }}
                margin="normal"
                variant="outlined"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <TextField
                label="Contenu de l'e-mail"
                multiline
                value={value}
                onChange={elt => setValue(elt.target.value)}
                className={classes.textField}
                InputProps={{ style: { width: '100%' }, id: 'content-email-textarea' }}
                margin="normal"
                variant="outlined"
              />
            </ListItem>
          </List>
        </div>

        <div>
          <Typography>
            Insérer des éléments
          </Typography>

          <Button data-tag="title" data-has-member="true" onClick={handleAddTagClick}>
            Titre
          </Button>
          <Button data-tag="subtitle" data-has-member="true" onClick={handleAddTagClick}>
            Sous-titre
          </Button>
          <Button data-tag="strong" data-has-member="true" onClick={handleAddTagClick}>
            Texte en gras
          </Button>
          <Button data-tag="new_line" data-has-member="false" onClick={handleAddTagClick}>
            Nouvelle ligne
          </Button>
          <Button data-tag="italic" data-has-member="true" onClick={handleAddTagClick}>
            Italique
          </Button>
          <Button data-tag="link" data-has-member="true" data-has-quotes="2" onClick={handleAddTagClick}>
            Lien
          </Button>
          <Button data-tag="auth_link" data-has-member="true" data-has-quotes="1" onClick={handleAddTagClick}>
            Lien vers page de connexion
          </Button>
        </div>
      </Dialog>

      <Dialog 
        open={willsend} 
        onClose={closeWillsend}
        className={insend ? classes.lockModal : undefined}
      >
        <DialogTitle>Envoyer cet e-mail ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ce message sera envoyé à {selected.length} personne{selected.length > 1 ? "s" : ""}. 
            Confirmer l'envoi de cet e-mail ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeWillsend} color="primary" autoFocus>
            Annuler
          </Button>
          <Button onClick={startSend} color="secondary">
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const useStyles2 = makeStyles(theme =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: theme.spacing(0.5),
    },
    chip: {
      margin: theme.spacing(0.5),
    },
    chipMore: {
      "& .MuiChip-label": {
        padding: '0 !important',
      },
      margin: theme.spacing(0.5),
    }
  }),
);

// Composant affichant les étudiants sélectionnés / à supprimer
const SenderMails: React.FC<{ mails: Student[], onDelete?: (students: Student[]) => void }> = props => {
  const [seeAll, setSeeAll] = React.useState(false);
  const classes = useStyles2(props);

  let mails = props.mails;
  const should_show_dots = !seeAll && mails.length > 3;

  if (!seeAll) {
    mails = mails.slice(0, 3);
  }

  return (
    <ListItemText 
      disableTypography 
      primary={`À ${props.mails.length} personne${props.mails.length > 1 ? "s" : ""}`} 
      secondary={
        <div className={classes.root}>
          {mails.map(student => <Chip
            key={student.id}
            label={`${student.first_name} ${student.last_name} <${student.email}>`}
            onDelete={() => props.onDelete?.(props.mails.filter(s => student.id !== s.id))}
            className={classes.chip}
          />)}
          {should_show_dots && <Chip 
            icon={<MoreIcon style={{ marginLeft: '5px', marginRight: '5px' }} />}
            className={classes.chipMore}
            onClick={() => setSeeAll(true)}
          />}
        </div>
      } 
    />
  );
};

export default ModalSendEmail;
