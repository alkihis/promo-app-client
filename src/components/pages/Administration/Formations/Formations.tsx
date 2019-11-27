import React from 'react';
import { Formation, FormationLevels } from '../../../../interfaces';
import APIHELPER from '../../../../APIHelper';
import { notifyError, BigPreloader } from '../../../../helpers';
import { DashboardContainer } from '../../../shared/Dashboard/Dashboard';
import { ListItem, List, ListItemText, ListItemSecondaryAction, IconButton, Typography, Checkbox, Dialog, DialogContent, Button, DialogTitle, DialogActions, DialogContentText, MenuItem, Menu } from '@material-ui/core';
import classes from './Formations.module.scss';
import { toast } from '../../../shared/Toaster/Toaster';
import FormationModal from '../../students/Informations/FormationModal';
import MoreIcon from '@material-ui/icons/MoreVert';

const ModifyFormation: React.FC = () => {
  const [formations, setFormations] = React.useState<Formation[] | undefined>(undefined);
  const [mergeMode, setMergeMode] = React.useState<false | number>(false);
  const [deleteMode, setDeleteMode] = React.useState<false | number>(false);
  const [selected, setSelected] = React.useState<number[]>([]);
  const [modalSelectionEdit, setModalSelectionEdit] = React.useState<false | [number, HTMLElement]>(false);
  const [modalEdit, setModalEdit] = React.useState<false | Formation>(false);
  const [modalFusion, setModalFusion] = React.useState(false);

  React.useEffect(() => {
    // Download formations
    APIHELPER.request('formation/all')
      .then(setFormations)
      .catch(notifyError);
  }, []);

  if (!formations) {
    return (
      <BigPreloader style={{ marginTop: '3rem' }} />
    );
  }

  function onChooseEdit() {
    const el = modalSelectionEdit as [number, HTMLElement];
    setModalSelectionEdit(false); 
    setModalEdit(formations!.find(c => c.id === el[0])!); 
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

      <FormationModal 
        open={!!modalEdit}
        base={modalEdit || undefined}
        modify
        onClose={() => setModalEdit(false)}
        onConfirm={c => {
          const formation_current = formations.findIndex(comp => comp.id === c.id);
          if (formation_current !== -1) {
            const new_ones = formations.slice();
            new_ones[formation_current] = c;
            setFormations(new_ones);
          }

          setModalEdit(false);
        }}
      />

      {modalFusion && <ModalFusionFormation
        main={formations.find(c => c.id === mergeMode)!}
        toMerge={formations.filter(c => selected.includes(c.id))}
        onClose={() => setModalFusion(false)}
        onMerge={company => {
          setModalFusion(false);
          // Vire les sélectionnées et la base, et ajoute la nouvelle
          setFormations([...formations.filter(c => !selected.includes(c.id) && c.id !== mergeMode), company]);
          setMergeMode(false);
          setSelected([]);
        }}
      />}

      {deleteMode && <ModalDeleteFormation
        toDelete={formations.find(c => c.id === deleteMode)!}
        onClose={() => setDeleteMode(false)}
        onDelete={() => {
          const to_delete = deleteMode;
          setDeleteMode(false);
          setFormations(formations.filter(c => c.id !== to_delete));
        }}
      />}

      <Typography variant="h4" gutterBottom>
        Formations enregistrées
      </Typography>

      {mergeMode && <>
        <Typography gutterBottom>
          Veuillez sélectionner les formations à fusionner.
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
        {/* List of formations available */}
        {formations.map(c => <ListItem key={c.id}>
          <ListItemText primary={c.branch} secondary={`${c.location} (${FormationLevels[c.level]})`} />

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
              <MenuItem onClick={onChooseDelete}>Supprimer</MenuItem>
            </Menu>
          </ListItemSecondaryAction>
        </ListItem>)}
      </List>

      {formations.length === 0 && <Typography variant="h6" color="textSecondary">
        Aucune formations n'est disponible.
      </Typography>}
    </DashboardContainer>
  );
};

function ModalFusionFormation(props: { 
  main: Formation,
  toMerge: Formation[],
  onClose: () => void,
  onMerge: (formation: Formation) => void
}) {
  const [inMerge, setInMerge] = React.useState(false);

  function mergeFormations() {
    setInMerge(true);

    APIHELPER.request('formation/merge', {
      method: 'POST',
      parameters: {
        main: props.main.id,
        children: props.toMerge.map(c => c.id)
      }
    }).then(() => {
      props.onMerge(props.main);
      toast("Les formations ont été fusionnées", "success");
    }).catch(notifyError).finally(() => setInMerge(false));
  }

  return (
    <Dialog open onClose={inMerge ? undefined : props.onClose}>
      <DialogTitle>{inMerge ? "Fusion..." : "Fusionner des formations"}</DialogTitle>

      <DialogContent className={inMerge ? classes.in_load : ""}>
        <DialogContentText>
          Les paramètres suivantes seront appliqués aux formations sélectionnées :
        </DialogContentText>
        
        <DialogContentText>
          Filière <strong>{props.main.branch}</strong>
          <br />

          Université <strong>{props.main.location}</strong>
          <br />

          Niveau <strong>{FormationLevels[props.main.level]}</strong>
        </DialogContentText>

        <DialogContentText>
          Confirmer la fusion ?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button disabled={inMerge} color="primary" onClick={props.onClose}>
          Annuler
        </Button>

        <Button disabled={inMerge} color="secondary" onClick={mergeFormations}>
          Fusionner
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ModalDeleteFormation(props: { 
  toDelete: Formation,
  onClose: () => void,
  onDelete: () => void
}) {
  const [inDelete, setInDelete] = React.useState(false);

  function deleteFormation() {
    setInDelete(true);

    APIHELPER.request('formation/' + String(props.toDelete.id), {
      method: 'DELETE'
    }).then(() => {
      props.onDelete();
      toast("La formation a été supprimée", "success");
    }).catch(notifyError).finally(() => setInDelete(false));
  }

  return (
    <Dialog open onClose={inDelete ? undefined : props.onClose}>
      <DialogTitle>{inDelete ? "Suppression..." : "Voulez-vous vraiment supprimer cette formation ?"}</DialogTitle>

      <DialogContent className={inDelete ? classes.in_load : ""}>
        <DialogContentText>
          Les étudiants ayant renseigné cette formation verront leur profil actualisé.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button disabled={inDelete} color="primary" onClick={props.onClose}>
          Annuler
        </Button>

        <Button disabled={inDelete} color="secondary" onClick={deleteFormation}>
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModifyFormation;
