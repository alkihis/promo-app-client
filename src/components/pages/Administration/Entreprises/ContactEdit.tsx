import React from 'react';
import { Company, Contact } from '../../../../interfaces';
import { DashboardContainer } from '../../../shared/Dashboard/Dashboard';
import APIHELPER from '../../../../APIHelper';
import { RouteComponentProps, useParams } from 'react-router-dom';
import { BigPreloader, notifyError } from '../../../../helpers';
import { Dialog, DialogTitle, DialogContent, Button, DialogActions, List, Typography, ListItemText, ListItem, DialogContentText, ListItemSecondaryAction, IconButton, Menu, MenuItem } from '@material-ui/core';
import classes from './ContactEdit.module.scss';
import { toast } from '../../../shared/Toaster/Toaster';
import ContactModal from '../../students/StudentJob/ContactModal';
import MoreIcon from '@material-ui/icons/MoreVert';

const ModifyContacts: React.FC<RouteComponentProps> = () => {
  const { id: company_id } = useParams();

  const [company, setCompany] = React.useState<Company | undefined>(undefined);
  const [contacts, setContacts] = React.useState<Contact[] | undefined>(undefined);
  const [modalSelectionEdit, setModalSelectionEdit] = React.useState<false | [number, HTMLElement]>(false);
  const [deleteMode, setDeleteMode] = React.useState<false | number>(false);
  const [modalEdit, setModalEdit] = React.useState<false | Contact>(false);

  React.useEffect(() => {
    // Download companies
    setContacts(undefined);
    setCompany(undefined);

    APIHELPER.request('company/' + String(company_id))
      .then(setCompany)
      .catch(notifyError);

    APIHELPER.request('contact/all', { parameters: { company: String(company_id) } })
      .then(setContacts)
      .catch(notifyError);
  }, [company_id]);

  if (!company || !contacts) {
    return (
      <BigPreloader style={{ marginTop: '3rem' }} />
    );
  }

  function onChooseEdit() {
    const el = modalSelectionEdit as [number, HTMLElement];
    setModalSelectionEdit(false); 
    setModalEdit(contacts!.find(c => c.id === el[0])!); 
  }

  function onChooseDelete() {
    const el = modalSelectionEdit as [number, HTMLElement];
    setDeleteMode(el[0]); 
    setModalSelectionEdit(false);
  }

  return (
    <DashboardContainer>
      <ContactModal 
        open={!!modalEdit}
        base={modalEdit || undefined}
        modify
        company={company}
        onClose={() => setModalEdit(false)}
        onConfirm={c => {
          const contact_current = contacts.findIndex(comp => comp.id === c!.id);
          if (contact_current !== -1) {
            const new_ones = contacts.slice();
            new_ones[contact_current] = c!;
            setContacts(new_ones);
          }

          setModalEdit(false);
        }}
      />

      {deleteMode && <ModalDeleteContact
        toDelete={contacts.find(c => c.id === deleteMode)!}
        onClose={() => setDeleteMode(false)}
        onDelete={() => {
          const to_delete = deleteMode;
          setDeleteMode(false);
          setContacts(contacts.filter(c => c.id !== to_delete));
        }}
      />}

      <Typography variant="h4" gutterBottom>
        Contacts de {company.name} à {company.town.split(',')[0]}
      </Typography>

      <List className={classes.lists_item}>
        {/* List of contacts available */}
        {contacts.map(c => <ListItem key={c.id}>
          <ListItemText primary={c.name} secondary={c.email} />

          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={evt => setModalSelectionEdit([c.id, evt.currentTarget])}>
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={modalSelectionEdit && modalSelectionEdit[0] === c.id ? modalSelectionEdit[1] : undefined}
              open={!!modalSelectionEdit && modalSelectionEdit[0] === c.id}
              onClose={() => setModalSelectionEdit(false)}
            >
              <MenuItem onClick={onChooseEdit}>Éditer</MenuItem>
              <MenuItem onClick={onChooseDelete}>Supprimer</MenuItem>
            </Menu>
          </ListItemSecondaryAction>
        </ListItem>)}
      </List>

      {contacts.length === 0 && <Typography variant="h6" color="textSecondary">
        Aucun contact n'est disponible pour cette entreprise.
      </Typography>}
    </DashboardContainer>
  );
};

function ModalDeleteContact(props: { 
  toDelete: Contact,
  onClose: () => void,
  onDelete: () => void
}) {
  const [inDelete, setInDelete] = React.useState(false);

  function deleteCompany() {
    setInDelete(true);

    APIHELPER.request('contact/' + String(props.toDelete.id), {
      method: 'DELETE'
    }).then(() => {
      props.onDelete();
      toast("Le contact a été supprimé", "success");
    }).catch(notifyError).finally(() => setInDelete(false));
  }

  return (
    <Dialog open onClose={inDelete ? undefined : props.onClose}>
      <DialogTitle>{inDelete ? "Suppression..." : "Voulez-vous vraiment supprimer ce contact ?"}</DialogTitle>

      <DialogContent className={inDelete ? classes.in_load : ""}>
        <DialogContentText>
          Les stages et emplois où le contact est spécifié n'auront plus de référant associé.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button disabled={inDelete} color="primary" onClick={props.onClose}>
          Annuler
        </Button>

        <Button disabled={inDelete} color="secondary" onClick={deleteCompany}>
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModifyContacts;
