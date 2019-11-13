import React from 'react';
import { Company, CompanyStatuses, CompanySizes, CompanySize, CompanyStatus, Student } from '../../../../interfaces';
import { Dialog, DialogContent, TextField, Button, Slide, AppBar, Toolbar, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Checkbox, FormControlLabel } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classes from './Modals.module.scss';
import { Marger, notifyError, DividerMargin } from '../../../../helpers';
import Autocomplete from '@material-ui/lab/Autocomplete';
import APIHELPER from '../../../../APIHelper';
import StudentContext from '../../../shared/StudentContext/StudentContext';
import { toast } from '../../../shared/Toaster/Toaster';

// TODO améliorer la reconnaissance des mots avec Lenvenstein

type CMProps = {
  onClose?: () => void;
  onConfirm?: (form?: Company) => void;
  open?: boolean;
  base?: Company;
  modify?: boolean;
}

type CMState = {
  name?: string;
  size?: CompanySize;
  status?: CompanyStatus;
  town?: string;
  available?: Company[];
  selected_id?: number;
  in_confirm: boolean;
  manual_company: boolean;
}

const Transition: any = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// check town existance: https://nominatim.openstreetmap.org/search?city=Paris&format=json
export default class CompanyModal extends React.Component<CMProps, CMState> {
  static contextType = StudentContext;
  context!: Student;

  constructor(props: CMProps) {
    super(props);

    this.state = {
      status: 'private',
      size: 'small',
      in_confirm: false,
      manual_company: false,
    };

    APIHELPER.request('company/all')
      .then((cps: Company[]) => {
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
      this.buildFromCompanyBase();
    }
  }

  componentDidUpdate(prev_props: CMProps) {
    if (this.props.open !== prev_props.open) {
      // Reset
      this.setState({
        status: 'private',
        size: 'small',
        in_confirm: false,
        selected_id: undefined,
        town: "",
        name: "",
        manual_company: false
      });
      // Actualise depuis le donné
      if (this.props.open && this.props.base) {
        this.buildFromCompanyBase();
      }
    }
  }
  
  buildFromCompanyBase() {
    if (this.props.base) {
      const b = this.props.base;
      this.setState({
        selected_id: b.id,
        manual_company: false
      });
    }
  }

  makeConfirm = () => {
    this.setState({
      in_confirm: true
    });

    let name: string, size: CompanySize, status: CompanyStatus, town: string;

    if (this.state.selected_id) {
      const comp = this.state.available?.find(c => c.id === this.state.selected_id);

      if (comp) {
        this.props.onConfirm?.(comp);
        this.setState({ in_confirm: false });
        return;
      }
    }

    name = this.state.name!; 
    size = this.state.size!;
    status = this.state.status!;
    town = this.state.town!;

    if (
      !name ||
      !size ||
      !status ||
      !town
    ) {
      // TODO vérification des champs et erreurs
      toast("Un ou plusieurs des champs ne respecte(nt) pas le format requis.", "warning");
      this.setState({ in_confirm: false });
      return;
    }

    // TODO gérer modification et pas création

    APIHELPER.request('company/create', { 
      parameters: { 
        user_id: this.context.id,
        name: this.state.name,
        size: this.state.size,
        status: this.state.status,
        city: this.state.town,
      },
      method: 'POST'
    })
      .then((cps: Company) => {
        this.props.onConfirm?.(cps);
        // Actualise le tableau si c'est nécessaire (l'entreprise crée n'est pas dedans)
        if (!this.state.available?.find(e => e.id === cps.id)) {
          this.setState({
            available: [...(this.state.available ?? []), cps]
          });
        }
      })
      .catch(e => {
        notifyError(e);
      })
      .finally(() => {
        this.setState({ in_confirm: false });
      });
  };

  handleStatusChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      status: evt.target.value as CompanyStatus
    });
  };

  handleSizeChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      size: evt.target.value as CompanySize
    });
  };

  handleNameChange = (evt: any) => {
    const name = evt?.target?.value;
    
    this.setState({
      name,
      selected_id: undefined
    });
  };

  handleTownChange = (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    this.setState({
      town: evt.target.value
    });
  };

  handleTownNChange = (_: any, value: string) => {
    this.setState({
      town: value
    });
  };

  handleManualCompanyChange = (_: any, checked: boolean) => {
    this.setState({
      manual_company: checked,
      selected_id: checked ? undefined : this.state.selected_id
    });
  };

  handleAutoCompanyChange = (_: any, new_value: Company | null) => {
    if (new_value === null) {
      this.setState({
        selected_id: undefined
      });
      return;
    }

    this.setState({
      selected_id: new_value.id,
      name: "",
      size: "small",
      status: "public",
      town: "",
    });
  };

  getAvailableTowns() {
    if (!this.state.available) {
      return [];
    }

    const selected = this.state.selected_id || this.props.base?.id;

    if (!selected) {
      return this.state.available?.map(e => e.town);
    }

    const s = this.state.available.find(e => e.id === selected);
    if (!s) {
      return this.state.available?.map(e => e.town);
    }

    return this.state.available?.filter(e => e.name === s.name).map(e => e.town);
  }

  render() {
    const selected_value = this.state.available && this.state.selected_id ? 
      this.state.available.find(f => f.id === this.state.selected_id) : 
      undefined;

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
              Entreprise
            </Typography>

            <Button color="inherit" onClick={this.props.onClose}>
              Annuler
            </Button>

            <Button color="inherit" onClick={this.makeConfirm}>
              Sauvegarder
            </Button>
          </Toolbar>
        </AppBar>

        <DialogContent>
          <div className={classes.flex_column_container}>
            <Marger size=".3rem" />

            <CompanyAutoSelect 
              options={this.state.available}
              value={selected_value ?? null}
              onChange={this.handleAutoCompanyChange}
              disabled={this.state.manual_company}
            />

            <Marger size=".5rem" />

            <FormControlLabel
              control={<Checkbox checked={this.state.manual_company} onChange={this.handleManualCompanyChange} />}
              label="Mon lieu d'embauche n'est pas dans la liste"
            />

            <DividerMargin size="1rem" />

            <TextField
              value={this.state.name}
              onChange={this.handleNameChange}
              label="Nom complet"
              disabled={!this.state.manual_company}
            />

            <Marger size=".5rem" />

            {/* Auto select de lieu avec API serait cool ! */}
            <TextField
              value={this.state.town}
              onChange={this.handleTownChange}
              label="Lieu"
              disabled={!this.state.manual_company}
            />

            <Marger size=".5rem" />

            <FormControl className={classes.flex_column_container}>
              <InputLabel id="label-select-status">Statut</InputLabel>
              <Select
                labelId="label-select-status"
                value={this.state.status}
                onChange={this.handleStatusChange}
                required
                disabled={!!this.state.selected_id || !this.state.manual_company}
              >
                {Object.entries(CompanyStatuses).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Marger size=".5rem" />

            <FormControl className={classes.flex_column_container}>
              <InputLabel id="label-select-size">Taille</InputLabel>
              <Select
                labelId="label-select-size"
                value={this.state.size}
                onChange={this.handleSizeChange}
                required
                disabled={!!this.state.selected_id || !this.state.manual_company}
              >
                {Object.entries(CompanySizes).map(([key, val]) => (
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

export const CompanyResume: React.FC<{ onLinkClick?: () => void, company?: Company }> = props => {
  return (
    <div>
      {props.company ? 
      <div>
        <Typography variant="h5">
          {props.company.name}
        </Typography>
        <Typography variant="h6">
          {props.company.town}
        </Typography>
      </div> :
      <div>
        Aucune entreprise n'est actuellement entrée.
      </div>
      }

      <Button color="primary" className={classes.enter_button} onClick={props.onLinkClick}>
        Modifier
      </Button>
    </div>
  );
};

function CompanyNameSelect(props: { 
  onChange: (event: React.ChangeEvent<{}>, value: any) => void, 
  value?: string,
  options?: string[],
  onInputChange: any
}) {
  const [open, setOpen] = React.useState(false);
  const loading = open && !props.options;
  const ref = React.useRef<HTMLInputElement>();

  const options = props.options ? [...new Set(props.options)] : undefined;
  
  return (
    <Autocomplete
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      // Supprime les noms identiques
      options={options}
      loading={loading}
      loadingText={"Chargement..."}
      noOptionsText={"Aucune entreprise à suggérer"}
      onChange={props.onChange}
      value={props.value ?? ""}
      autoComplete
      freeSolo
      clearOnEscape={false}
      renderInput={params => (
        <TextField
          {...params}
          label="Nom de l'entreprise/laboratoire"
          fullWidth
          onChange={props.onInputChange}
          variant="outlined"
        />
      )}
    />
  )
}

function CompanyTownSelect(props: { 
  onChange?: (event: React.ChangeEvent<{}>, value: any) => void, 
  value?: string,
  options?: string[],
  disabled?: boolean,
  onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
}) {
  const [open, setOpen] = React.useState(false);
  const loading = open && !props.options;
  const options = props.options ? [...new Set(props.options)] : undefined;

  return (
    <Autocomplete
      open={open}
      disabled={props.disabled}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      // Supprime les noms identiques
      options={options}
      loading={loading}
      disableClearable
      clearOnEscape={false}
      loadingText={"Chargement..."}
      noOptionsText={"Aucun lieu à suggérer"}
      onChange={props.onChange}
      value={props.value ?? ""}
      freeSolo
      renderInput={params => (
        <TextField
          {...params}
          label="Ville"
          fullWidth
          variant="outlined"
          required
          onChange={props.onInputChange}
          value={props.value}
          InputProps={{
            ...params.InputProps,
            value: props.value,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}

function CompanyAutoSelect(props: { 
  onChange: (event: React.ChangeEvent<{}>, value: Company | null) => void, 
  value: Company | null,
  options?: Company[],
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
      getOptionLabel={(c: Company) => c.name + ", " + c.town}
      options={options}
      loading={loading}
      loadingText={"Chargement..."}
      noOptionsText={"Aucune entreprise à suggérer"}
      onChange={props.onChange}
      value={props.value}
      autoComplete
      disabled={props.disabled}
      renderInput={params => (
        <TextField
          {...params}
          label="Rechercher une entreprise..."
          fullWidth
          variant="outlined"
        />
      )}
    />
  )
}
