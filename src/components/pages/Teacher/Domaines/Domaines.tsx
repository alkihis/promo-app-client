import React from 'react';
import { FullDomain } from '../../../../interfaces';
import { DashboardContainer } from '../../../shared/Dashboard/Dashboard';
import APIHELPER from '../../../../utils/APIHelper';
import { BigPreloader, notifyError, DividerMargin, Marger } from '../../../../utils/helpers';
import { Dialog, DialogTitle, DialogContent, Button, DialogActions, List, Typography, ListItemText, ListItem, DialogContentText, ListItemSecondaryAction, IconButton, Menu, MenuItem, TextField } from '@material-ui/core';
import classes from './Domaines.module.scss';
import { toast } from '../../../shared/Toaster/Toaster';
import MoreIcon from '@material-ui/icons/MoreVert';
import clsx from 'clsx';

const ModifyDomains: React.FC = () => {
  const [domains, setDomains] = React.useState<FullDomain[] | undefined>(undefined);
  const [modalSelectionEdit, setModalSelectionEdit] = React.useState<false | [number, HTMLElement]>(false);
  const [deleteMode, setDeleteMode] = React.useState<false | number>(false);
  const [modalEdit, setModalEdit] = React.useState<false | FullDomain>(false);
  const [modalCreate, setModalCreate] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Download companies
    setDomains(undefined);

    APIHELPER.request('domain/all')
      .then(setDomains)
      .catch(notifyError);
  }, []);

  if (!domains) {
    return (
      <BigPreloader style={{ marginTop: '3rem' }} />
    );
  }

  function onChooseEdit() {
    const el = modalSelectionEdit as [number, HTMLElement];
    setModalSelectionEdit(false); 
    setModalEdit(domains!.find(c => c.id === el[0])!); 
  }

  function onChooseDelete() {
    const el = modalSelectionEdit as [number, HTMLElement];
    setDeleteMode(el[0]); 
    setModalSelectionEdit(false);
  }

  return (
    <DashboardContainer>
      <DomainModal 
        open={!!modalEdit}
        base={modalEdit || undefined}
        modify
        onClose={() => setModalEdit(false)}
        onConfirm={c => {
          const contact_current = domains.findIndex(comp => comp.id === c!.id);
          if (contact_current !== -1) {
            const new_ones = domains.slice();
            new_ones[contact_current] = c!;
            setDomains(new_ones);
          }

          setModalEdit(false);
        }}
      />

      <DomainModal 
        open={modalCreate}
        onClose={() => setModalCreate(false)}
        onConfirm={c => {
          const contact_current = domains.findIndex(comp => comp.id === c!.id);
          if (contact_current !== -1) {
            const new_ones = domains.slice();
            new_ones[contact_current] = c!;
            setDomains(new_ones);
          }
          else {
            // Il n'existe pas
            const new_ones = domains.slice();
            new_ones.push(c);
            setDomains(new_ones);
          }

          setModalCreate(false);
        }}
      />

      {deleteMode && <ModalDeleteDomain
        toDelete={domains.find(c => c.id === deleteMode)!}
        onClose={() => setDeleteMode(false)}
        onDelete={() => {
          const to_delete = deleteMode;
          setDeleteMode(false);
          setDomains(domains.filter(c => c.id !== to_delete));
        }}
      />}

      <Typography variant="h4" gutterBottom>
        Domaines enregistrés
      </Typography>

      <List className={classes.lists_item}>
        {/* List of contacts available */}
        {domains.map(c => <ListItem key={c.id}>
          <ListItemText primary={c.name} />

          {c.domain !== "other" && <ListItemSecondaryAction>
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
          </ListItemSecondaryAction>}
        </ListItem>)}
      </List>

      {domains.length === 0 && <Typography variant="h6" color="textSecondary">
        Aucun domaine n'est enregistré
      </Typography>}

      <DividerMargin size="1.5rem" />

      <Button variant="outlined" fullWidth color="secondary" onClick={() => setModalCreate(true)}>
        Ajouter un domaine
      </Button>

      <Marger size="1rem" />
    </DashboardContainer>
  );
};

function ModalDeleteDomain(props: { 
  toDelete: FullDomain,
  onClose: () => void,
  onDelete: () => void
}) {
  const [inDelete, setInDelete] = React.useState(false);

  function deleteCompany() {
    setInDelete(true);

    APIHELPER.request('domain/' + String(props.toDelete.id), {
      method: 'DELETE'
    }).then(() => {
      props.onDelete();
      toast("Le domaine a été supprimé", "success");
    }).catch(notifyError).finally(() => setInDelete(false));
  }

  return (
    <Dialog open onClose={inDelete ? undefined : props.onClose}>
      <DialogTitle>{inDelete ? "Suppression..." : "Voulez-vous vraiment supprimer ce domaine ?"}</DialogTitle>

      <DialogContent className={inDelete ? classes.in_load : ""}>
        <DialogContentText>
          Les stages et emplois où le domaine est spécifié auront leur domaine d'activité défini sur "Autre".
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

type CMProps = {
  onClose?: () => void;
  onConfirm?: (form: FullDomain) => void;
  open?: boolean;
  base?: FullDomain;
  modify?: boolean;
}

type CMState = {
  in_load: boolean;
  full_name: string;
};

// Returned by make confirm is a unsended contact (id=0) to create or a already created (id>0)
class DomainModal extends React.Component<CMProps, CMState> {
  constructor(props: CMProps) {
    super(props);

    this.state = {
      full_name: "",
      in_load: false
    };
  }

  componentDidMount() {
    this.buildFromDomainBase();
  }

  componentDidUpdate(old_props: CMProps) {
    if (this.props.open !== old_props.open) {
      // Reset
      this.setState({
        full_name: "",
      });

      if (this.props.open) {
        this.buildFromDomainBase();
      }
    }
  }

  buildFromDomainBase() {
    if (this.props.base) {
      const b = this.props.base;

      this.setState({
        full_name: b.name
      });
    }
  }

  makeConfirm = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();

    this.setState({
      in_load: true
    });

    if (!this.state.full_name) {
      this.setState({
        in_load: false
      });

      toast("Vous ne pouvez pas sauvegarder un domaine incomplet.", "warning");
      return;
    }

    let domain: FullDomain = {
      id: this.props.base?.id ?? 0,
      name: this.state.full_name,
      domain: this.state.full_name
    };

    try {
      domain = await APIHELPER.request('domain/' + (this.props.modify ? 'modify' : 'create'), {
        method: 'POST',
        parameters: domain
      });
    } catch (e) {
      notifyError(e);
      this.setState({
        in_load: false
      });

      return;
    }

    this.setState({
      in_load: false
    });

    this.props.onConfirm?.(domain);
  };

  handleFullNameChange = (evt: any) => {
    const name = evt.target.value;
    this.setState({
      full_name: name
    });
  };

  render() {
    return (
      <Dialog
        fullWidth 
        open={this.props.open!} 
        onClose={this.props.onClose}
        className={clsx(classes.modal_base, this.state.in_load ? classes.in_load_modal : "")}
      >
        <DialogTitle>Domaine</DialogTitle>
        <form onSubmit={this.makeConfirm}>
          <DialogContent style={{ minWidth: '10vw', maxWidth: '550px' }}>
            <DialogContentText style={{ marginBottom: '1.5rem', marginTop: '-8px' }}>
              Domaine d'activité d'entreprise.
            </DialogContentText>
 
            <TextField 
              value={this.state.full_name}
              onChange={this.handleFullNameChange}
              label="Nom complet"
              required
              fullWidth
              variant="outlined"
              type="mail"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.onClose} type="button" color="secondary">
              Annuler
            </Button>
            <Button type="submit" color="primary">
              Sauvegarder
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default ModifyDomains;
