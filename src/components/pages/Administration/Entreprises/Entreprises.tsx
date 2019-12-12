import React from 'react';
import { Company, CompanyStatuses, CompanySizes } from '../../../../interfaces';
import APIHELPER from '../../../../APIHelper';
import { notifyError, BigPreloader } from '../../../../helpers';
import { DashboardContainer } from '../../../shared/Dashboard/Dashboard';
import { ListItem, List, ListItemText, ListItemSecondaryAction, IconButton, Typography, Checkbox, Dialog, DialogContent, Button, DialogTitle, DialogActions, DialogContentText, Menu, MenuItem } from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreVert';
import classes from './Entreprises.module.scss';
import { toast } from '../../../shared/Toaster/Toaster';
import { Link as RouterLink } from 'react-router-dom';
import CompanyModal from '../../students/StudentJob/CompanyModal';

const ModifyCompany: React.FC = () => {
  const [companies, setCompanies] = React.useState<Company[] | undefined>(undefined);
  const [mergeMode, setMergeMode] = React.useState<false | number>(false);
  const [deleteMode, setDeleteMode] = React.useState<false | number>(false);
  const [selected, setSelected] = React.useState<number[]>([]);
  const [modalSelectionEdit, setModalSelectionEdit] = React.useState<false | [number, HTMLElement]>(false);
  const [modalEdit, setModalEdit] = React.useState<false | Company>(false);
  const [modalFusion, setModalFusion] = React.useState(false);

  React.useEffect(() => {
    // Download companies
    APIHELPER.request('company/all')
      .then(setCompanies)
      .catch(notifyError);
  }, []);

  if (!companies) {
    return (
      <BigPreloader style={{ marginTop: '3rem' }} />
    );
  }

  function onChooseEdit() {
    const el = modalSelectionEdit as [number, HTMLElement];
    setModalSelectionEdit(false); 
    setModalEdit(companies!.find(c => c.id === el[0])!); 
  }

  function onChooseMerge() {
    const el = modalSelectionEdit as [number, HTMLElement];
    setModalSelectionEdit(false); 
    setMergeMode(el[0]); 
    setSelected([]);
  }

  function onChooseDelete() {
    const el = modalSelectionEdit as [number, HTMLElement];
    setDeleteMode(el[0]); 
    setModalSelectionEdit(false);
  }

  return (
    <DashboardContainer>
      <CompanyModal 
        open={!!modalEdit}
        base={modalEdit || undefined}
        modify
        onClose={() => setModalEdit(false)}
        onConfirm={c => {
          const company_current = companies.findIndex(comp => comp.id === c.id);
          if (company_current !== -1) {
            const new_ones = companies.slice();
            new_ones[company_current] = c;
            setCompanies(new_ones);
          }

          setModalEdit(false);
        }}
      />

      {modalFusion && <ModalFusionCompany 
        main={companies.find(c => c.id === mergeMode)!}
        toMerge={companies.filter(c => selected.includes(c.id))}
        onClose={() => setModalFusion(false)}
        onMerge={company => {
          setModalFusion(false);
          // Vire les sélectionnées et la base, et ajoute la nouvelle
          setCompanies([...companies.filter(c => !selected.includes(c.id) && c.id !== mergeMode), company]);
          setMergeMode(false);
          setSelected([]);
        }}
      />}

      {deleteMode && <ModalDeleteCompany 
        toDelete={companies.find(c => c.id === deleteMode)!}
        onClose={() => setDeleteMode(false)}
        onDelete={() => {
          const to_delete = deleteMode;
          setDeleteMode(false);
          setCompanies(companies.filter(c => c.id !== to_delete));
        }}
      />}

      <Typography variant="h4" gutterBottom>
        Entreprises enregistrées
      </Typography>

      {mergeMode && <>
        <Typography gutterBottom>
          Veuillez sélectionner les entreprises à fusionner.
        </Typography>

        <div className={classes.merge_buttons}>
          <Button className="button-green" disabled={!selected.length} onClick={() => setModalFusion(true)}>
            Fusionner
          </Button>
          <Button color="primary" onClick={() => { setMergeMode(false); setSelected([]); }}>
            Annuler
          </Button>
        </div>
      </>}

      <List className={classes.lists_item}>
        {/* List of companies available */}
        {companies.map(c => <ListItem key={c.id}>
          <ListItemText primary={c.name} secondary={`${c.town} (${CompanyStatuses[c.status]})`} />

          <ListItemSecondaryAction>
            {mergeMode ? 
              <Checkbox
                edge="end"
                onChange={(_, checked) => {
                  if (checked) {
                    setSelected([...selected, c.id]);
                  }
                  else {
                    setSelected(selected.filter(s => s !== c.id));
                  }
                }}
                checked={mergeMode === c.id || selected.includes(c.id)}
                disabled={mergeMode === c.id}
              /> :
              <IconButton edge="end" onClick={evt => setModalSelectionEdit([c.id, evt.currentTarget])}>
                <MoreIcon />
              </IconButton>
            }
            <Menu
              anchorEl={modalSelectionEdit && modalSelectionEdit[0] === c.id ? modalSelectionEdit[1] : undefined}
              open={!!modalSelectionEdit && modalSelectionEdit[0] === c.id}
              onClose={() => setModalSelectionEdit(false)}
            >
              <MenuItem onClick={onChooseEdit}>Éditer</MenuItem>
              <MenuItem onClick={onChooseMerge}>Fusionner...</MenuItem>
              <MenuItem>
                <RouterLink className="link no-underline" to={"/teacher/contact/" + String(c.id)}>
                  Gérer les contacts
                </RouterLink>
              </MenuItem>
              <MenuItem onClick={onChooseDelete}>Supprimer</MenuItem>
            </Menu>
          </ListItemSecondaryAction>
        </ListItem>)}
      </List>

      {companies.length === 0 && <Typography variant="h6" color="textSecondary">
        Aucune entreprise n'est disponible.
      </Typography>}
    </DashboardContainer>
  );
};

function ModalFusionCompany(props: { 
  main: Company,
  toMerge: Company[],
  onClose: () => void,
  onMerge: (new_company: Company) => void
}) {
  const [inMerge, setInMerge] = React.useState(false);

  function mergeCompanies() {
    setInMerge(true);

    APIHELPER.request('company/merge', {
      method: 'POST',
      parameters: {
        main: props.main.id,
        children: props.toMerge.map(c => c.id)
      }
    }).then(() => {
      props.onMerge(props.main);
      toast("Les entreprises ont été fusionnées", "success");
    }).catch(notifyError).finally(() => setInMerge(false));
  }

  return (
    <Dialog open onClose={inMerge ? undefined : props.onClose}>
      <DialogTitle>{inMerge ? "Fusion..." : "Fusionner des entreprises"}</DialogTitle>

      <DialogContent className={inMerge ? classes.in_load : ""}>
        <DialogContentText>
          Les paramètres suivants seront appliqués aux entreprises sélectionnées :
        </DialogContentText>
        
        <DialogContentText>
          Nom <strong>{props.main.name}</strong>
          <br />

          Ville <strong>{props.main.town}</strong>
          <br />

          Statut <strong>{CompanyStatuses[props.main.status]}</strong>
          <br />

          Taille <strong>{CompanySizes[props.main.size]}</strong>
        </DialogContentText>

        <DialogContentText>
          Confirmer la fusion ?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button disabled={inMerge} color="primary" onClick={props.onClose}>
          Annuler
        </Button>

        <Button disabled={inMerge} color="secondary" onClick={mergeCompanies}>
          Fusionner
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ModalDeleteCompany(props: { 
  toDelete: Company,
  onClose: () => void,
  onDelete: () => void
}) {
  const [inDelete, setInDelete] = React.useState(false);

  function deleteCompany() {
    setInDelete(true);

    APIHELPER.request('company/' + String(props.toDelete.id), {
      method: 'DELETE'
    }).then(() => {
      props.onDelete();
      toast("L'entreprise a été supprimée", "success");
    }).catch(notifyError).finally(() => setInDelete(false));
  }

  return (
    <Dialog open onClose={inDelete ? undefined : props.onClose}>
      <DialogTitle>{inDelete ? "Suppression..." : "Voulez-vous vraiment supprimer cette entreprise ?"}</DialogTitle>

      <DialogContent className={inDelete ? classes.in_load : ""}>
        <DialogContentText>
          Tous les contacts, stages et emplois liés à cette entreprise seront irrémédiablement supprimés.
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

export default ModifyCompany;
