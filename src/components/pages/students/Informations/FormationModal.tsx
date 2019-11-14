import React from 'react';
import { Student, Formation, FormationLevel, FormationLevels } from '../../../../interfaces';
import { Dialog, DialogContent, TextField, Button, Slide, AppBar, Toolbar, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Checkbox, FormControlLabel, Hidden } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classes from '../StudentJob/Modals.module.scss';
import { Marger, notifyError, DividerMargin } from '../../../../helpers';
import Autocomplete from '@material-ui/lab/Autocomplete';
import APIHELPER from '../../../../APIHelper';
import StudentContext from '../../../shared/StudentContext/StudentContext';
import { toast } from '../../../shared/Toaster/Toaster';

// TODO améliorer la reconnaissance des mots avec Lenvenstein

type FMProps = {
  onClose?: () => void;
  onConfirm?: (form?: Formation) => void;
  open?: boolean;
  base?: Formation;
  modify?: boolean;
}

type FMState = {
  branch: string;
  level: FormationLevel;
  location: string;
  available?: Formation[];
  selected?: Formation;
  in_confirm: boolean;
  manual_formation: boolean;
}

const Transition: any = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// TODO faire un modal de sélection de lieu ?
export default class FormationModal extends React.Component<FMProps, FMState> {
  static contextType = StudentContext;
  context!: Student;

  constructor(props: FMProps) {
    super(props);

    this.state = {
      branch: "",
      level: "license",
      location: "",
      in_confirm: false,
      available: undefined,
      manual_formation: false,
    };

    APIHELPER.request('formation/all')
      .then((cps: Formation[]) => {
        this.setState({
          available: cps
        });
      })
      .catch(e => {
        notifyError(e);
      });
  }

  componentDidMount() {
    if (this.props.base) {
      this.buildFromFormationBase();
    }
  }

  componentDidUpdate(prev_props: FMProps) {
    if (this.props.open !== prev_props.open) {
      // Reset
      this.setState({
        branch: '',
        level: 'license',
        location: "",
        selected: undefined,
        in_confirm: false,
        manual_formation: false
      });
      // Actualise depuis le donné
      if (this.props.open && this.props.base) {
        this.buildFromFormationBase();
      }
    }
  }
  
  buildFromFormationBase() {
    if (this.props.base) {
      const b = this.props.base;
      this.setState({
        selected: b,
        manual_formation: false
      });
    }
  }

  makeConfirm = () => {
    this.setState({
      in_confirm: true
    });

    if (this.state.selected !== undefined) {
      this.props.onConfirm?.(this.state.selected);
      this.setState({ in_confirm: false });
      return;
    }

    if (
      !this.state.branch ||
      !this.state.location ||
      !this.state.level
    ) {
      // TODO vérification des champs et erreurs
      toast("Un ou plusieurs des champs ne respecte(nt) pas le format requis.", "warning");
      this.setState({ in_confirm: false });
      return;
    }

    // TODO gérer modification et pas création
    const cps: Formation = {
      id: 0,
      branch: this.state.branch!,
      location: this.state.location!,
      level: this.state.level!
    };

    this.props.onConfirm?.(cps);
    if (!this.state.available?.find(e => e.id === cps.id)) {
      this.setState({
        available: [...(this.state.available ?? []), cps],
        selected: cps,
        in_confirm: false
      });
    }
    else {
      this.setState({
        in_confirm: false
      });
    }
  };

  handleLevelChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      level: evt.target.value as FormationLevel
    });
  };

  handleBranchChange = (evt: any) => {
    const name = evt?.target?.value;
    
    this.setState({
      branch: name,
      selected: undefined
    });
  };

  handleLocationChange = (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    this.setState({
      location: evt.target.value
    });
  };

  handleManualFormationChange = (_: any, checked: boolean) => {
    this.setState({
      manual_formation: checked,
      selected: checked ? undefined : this.state.selected
    });
  };

  handleAutoFormationChange = (_: any, new_value: Formation | null) => {
    if (new_value === null) {
      this.setState({
        selected: undefined
      });
      return;
    }

    this.setState({
      selected: new_value,
      branch: "",
      location: "",
      level: "license",
    });
  };

  render() {
    const selected_value = this.state.selected;

    return (
      <Dialog 
        className={classes.dialog + " " + (this.state.in_confirm ? classes.in_load : "")} 
        fullScreen 
        open={this.props.open!} 
        onClose={this.props.onClose} 
        TransitionComponent={Transition}
      >
        <AppBar style={{position: 'relative'}}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={this.props.onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" style={{ flex: 1, marginLeft: '1.2rem' }}>
              Formation
            </Typography>

            <Hidden smDown>
              <Button color="inherit" onClick={this.props.onClose}>
                Annuler
              </Button>
            </Hidden>

            <Button color="inherit" onClick={this.makeConfirm}>
              Sauvegarder
            </Button>
          </Toolbar>
        </AppBar>

        <DialogContent>
          <div className={classes.flex_column_container}>
            <Marger size=".3rem" />

            <FormationAutoSelect 
              options={this.state.available}
              value={selected_value ?? null}
              onChange={this.handleAutoFormationChange}
              disabled={this.state.manual_formation}
            />

            <Marger size=".5rem" />

            <FormControlLabel
              control={<Checkbox checked={this.state.manual_formation} onChange={this.handleManualFormationChange} />}
              label="Ma formation n'est pas dans la liste"
            />

            <DividerMargin size="1rem" />

            <TextField
              value={this.state.branch}
              onChange={this.handleBranchChange}
              label="Nom complet (branche incluse)"
              disabled={!this.state.manual_formation}
              helperText="N'incluez pas le niveau (licence, master...) dans le nom de la filière."
            />

            <Marger size=".5rem" />

            {/* Auto select de lieu avec API serait cool ! */}
            <TextField
              value={this.state.location}
              onChange={this.handleLocationChange}
              label="Lieu (Université)"
              disabled={!this.state.manual_formation}
            />

            <Marger size=".5rem" />

            <FormControl className={classes.flex_column_container}>
              <InputLabel id="label-select-status">Niveau d'étude</InputLabel>
              <Select
                labelId="label-select-status"
                value={this.state.level}
                onChange={this.handleLevelChange}
                required
                disabled={!!this.state.selected || !this.state.manual_formation}
              >
                {Object.entries(FormationLevels).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>          
        </DialogContent>
      </Dialog>
    );
  }
}

export const FormationResume: React.FC<{ 
  onLinkClick?: () => void, 
  formation?: Formation,
  onDeleteClick?: () => void,
}> = props => {
  return (
    <div>
      {props.formation ? 
      <div>
        <Typography variant="h5">
          {props.formation.branch} {" "}
          <Typography color="textSecondary" style={{ fontSize: '.9rem' }}>
            {FormationLevels[props.formation.level]}
          </Typography>
        </Typography>
        <Typography variant="h6">
          {props.formation.location}
        </Typography>
      </div> :
      <div>
        Vous n'avez défini aucune formation ici.
      </div>
      }

      <Button color="secondary" className={classes.enter_button} onClick={props.onLinkClick}>
        Modifier
      </Button>
      <Button color="primary" className={classes.enter_button} onClick={props.onDeleteClick}>
        Supprimer
      </Button>
    </div>
  );
};

function FormationAutoSelect(props: { 
  onChange: (event: React.ChangeEvent<{}>, value: Formation | null) => void, 
  value: Formation | null,
  options?: Formation[],
  disabled?: boolean,
}) {
  const [open, setOpen] = React.useState(false);
  const loading = open && !props.options;

  const options = props.options;
  
  return (
    <Autocomplete
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionLabel={(c: Formation) => c.branch + ", " + c.location + " (" + FormationLevels[c.level] + ")"}
      options={options}
      loading={loading}
      loadingText={"Chargement..."}
      noOptionsText={"Aucune formation à suggérer"}
      onChange={props.onChange}
      value={props.value}
      autoComplete
      disabled={props.disabled}
      renderInput={params => (
        <TextField
          {...params}
          label="Rechercher une formation..."
          fullWidth
          variant="outlined"
        />
      )}
    />
  )
}
