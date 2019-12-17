import React from 'react';
import { Company, CompanyStatuses, CompanySizes, CompanySize, CompanyStatus, Student } from '../../../../interfaces';
import { Dialog, DialogContent, TextField, Button, Slide, AppBar, Toolbar, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Hidden, DialogTitle, DialogContentText, Link, DialogActions } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classes from './Modals.module.scss';
import { Marger, notifyError, DividerMargin, BigPreloader } from '../../../../helpers';
import Autocomplete from '@material-ui/lab/Autocomplete';
import APIHELPER from '../../../../APIHelper';
import StudentContext from '../../../shared/StudentContext/StudentContext';
import { toast } from '../../../shared/Toaster/Toaster';
import Similarity from 'string-similarity';

type CMProps = {
  onClose?: () => void;
  onConfirm?: (form: Company) => void;
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
  should_confirm_town: boolean | null;
  manual_company: boolean;
  modify_id?: number;
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
      should_confirm_town: false,
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
      if (this.props.modify) {
        this.setState({
          manual_company: true,
          status: b.status,
          town: b.town,
          name: b.name,
          size: b.size,
          modify_id: b.id,
        });
      }
      else {
        this.setState({
          selected_id: b.id,
          manual_company: false,
          modify_id: undefined
        });
      }
    }
  }

  makeConfirm = async () => {
    if (this.state.selected_id === undefined && this.state.should_confirm_town !== null) {
      if (!this.state.town) {
        toast("Aucune ville n'a été spécifiée.", "error");
        return;
      }

      // Si on est en mode selection, affiche le modal de sélection de ville
      this.setState({
        should_confirm_town: true
      });

      return;
    }
    
    this.setState({
      in_confirm: true,
      should_confirm_town: false,
    });

    let name: string, size: CompanySize, status: CompanyStatus, town: string;

    if (this.state.selected_id !== undefined) {
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

    let cps: Company = {
      id: 0,
      name: this.state.name!,
      size: this.state.size!,
      status: this.state.status!,
      town: this.state.town!,
    };

    // In case of modify
    if (this.props.modify && this.state.modify_id) {
      cps.id = this.state.modify_id;

      try {
        cps = await APIHELPER.request('company/modify', {
          method: 'POST',
          parameters: cps
        });
      } catch (e) {
        notifyError(e);

        this.setState({
          in_confirm: false
        });

        return;
      }
    }

    this.props.onConfirm?.(cps);

    if (!this.state.available?.find(e => e.id === cps.id)) {
      this.setState({
        available: [...(this.state.available ?? []), cps],
        selected_id: cps.id,
        in_confirm: false
      });
    }
    else {
      const index = this.state.available?.findIndex(e => e.id === cps.id);

      if (index !== undefined && index !== -1) {
        this.state.available![index] = cps;
      }

      this.setState({
        in_confirm: false
      });
    }
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

  handleTownChange = (_: any, new_value: string | null) => {
    this.setState({
      town: new_value ?? undefined,
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

    return [...new Set(this.state.available.map(e => e.town))];
  }

  render() {
    const selected_value = this.state.available && this.state.selected_id !== undefined ? 
      this.state.available.find(f => f.id === this.state.selected_id) : 
      undefined;

    return (
      <>
        {/* Si nécessaire, rend le modal de sélection de ville */}
        {this.state.should_confirm_town && <ModalTownValidation 
          town_selected={this.state.town!}
          onClose={() => this.setState({ should_confirm_town: false })}
          onConfirm={town => {
            this.setState({ town, should_confirm_town: null });
            setTimeout(() => {
              this.makeConfirm();
            }, 5);
          }}
        />}

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

              {!this.props.modify && <>
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
              </>}

              <TextField
                value={this.state.name}
                onChange={this.handleNameChange}
                label="Nom complet"
                disabled={!this.state.manual_company}
              />

              <Marger size=".5rem" />

              {/* Auto select de lieu avec API serait cool ! */}
              <TownAutoSelect
                options={this.getAvailableTowns()}
                value={this.state.town ?? null}
                onChange={this.handleTownChange}
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
      </>
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

function TownAutoSelect(props: {
  onChange: (event: React.ChangeEvent<{}>, value: string | null) => void, 
  value: string | null,
  options?: string[],
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
      options={options}
      loading={loading}
      loadingText={"Chargement..."}
      noOptionsText={"Aucune ville à suggérer"}
      filterOptions={(options: string[]) => {
        // Bug: state.inputValue does not work when freeSolo=true
        const input_value = (document.querySelector('[data-town-select-id]') as HTMLInputElement).value;
        
        return options
          .map(o => [o, Similarity.compareTwoStrings(input_value.split(',')[0], o.split(',')[0])] as [string, number])
          .sort((a, b) => b[1] - a[1])
          .map(o => o[0]);
      }}
      onInputChange={props.onChange}
      freeSolo
      value={props.value}
      autoComplete
      disabled={props.disabled}
      renderInput={params => (
        <TextField
          {...params}
          inputProps={{"data-town-select-id": "input-town-autoselect", ...params.inputProps}}
          label="Ville de l'entreprise"
          fullWidth
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
      filterOptions={(options: Company[], state) => {
        const input_value = state.inputValue;
        
        return options
          .map(o => [o, Similarity.compareTwoStrings(
            input_value.split(',')[0].toLocaleLowerCase(), 
            o.name.split(',')[0].toLocaleLowerCase()
          )] as [Company, number])
          .sort((a, b) => b[1] - a[1])
          .map(o => o[0]);
      }}
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

function ModalTownValidation(props: { 
  town_selected: string,
  onClose?: () => void,
  onConfirm?: (confirmed: string) => void
}) {
  const [validation, setValidation] = React.useState<string[] | undefined>(undefined);
  const [suggested, setSuggested] = React.useState("");

  // Téléchargement des suggestions
  React.useEffect(() => {
    const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(props.town_selected) + "&format=json";

    // Télécharge depuis un serveur openstreetmap
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(r.text()))
      .then((data: any) => {
        // Filtre uniquement les villes valides
        const d: { display_name: string, type: string }[] = data
          .filter((d: any) => d.type === "town" || d.type === "city" || d.type === "administrative")
          .filter((d: any) => d.display_name);

        // Trie en fonction du pays (france en premier)
        // Puis génère le texte
        const texts = d.map(d => {
          const splitted = d.display_name.split(',');
          const town = splitted[0].trim();
          const region = splitted[1].trim();
          const land = splitted[splitted.length - 1];
          
          return [town, region, land?.trim() ?? ""];
        }).sort((town1, town2) => {
          if (town1[2] === town2[2]) {
            return 0;
          }
          if (town1[2] === "France") {
            return -1;
          }
          if (town2[2] === "France") {
            return 1;
          }
          return town1[2] > town2[2] ? 1 : -1;
        })
        .map(([town, region, land]) => {
          if (land)
            return `${town}, ${region}, ${land.trim()}`;
          else
            return town + ", " + region;
        });

        const filtered_texts = [...new Set(texts)];
        setValidation(filtered_texts);    
        
        if (filtered_texts.length && filtered_texts[0] === props.town_selected) {
          // OK, pas besoin de confirmation
          props.onConfirm?.(props.town_selected);
        }
      })
      .catch(err => {
        toast("Une erreur inconnue est survenue.", "error");
        console.error(err);
        setValidation([]);
      })
  }, [props]);

  function confirmInitial() {
    // Confirmer la ville initialement saisie
    props.onConfirm?.(props.town_selected);
  }

  function confirmSelection() {
    // Confirmer une ville town spécifique
    const town = suggested ? suggested : validation![0];
    props.onConfirm?.(town);
  }
  
  return (
    <Dialog open={true}>
      <DialogTitle>Validation de la ville</DialogTitle>

      <DialogContent>
        {!validation && <BigPreloader style={{marginTop: '2rem'}} />}
        
        {validation && validation.length === 0 && <div>
          <DialogContentText>
            Aucune ville correspondant à votre ville "{props.town_selected}" n'a été trouvée.
            Vérifiez votre saisie avant de confirmer.
            Si vous êtes sûr•e de continuer, cliquez sur "valider".
          </DialogContentText>
        </div>}

        {validation && validation.length === 1 && <div>
          <DialogContentText>
            La ville entrée correspond-elle à <strong>{validation[0]}</strong> ?
            Si oui, cliquez sur "valider".
            Si vous souhaitez garder la ville que vous avez renseignée initialement, cliquez <Link 
              href="#!"
              onClick={confirmInitial}
            >ici</Link>.
          </DialogContentText>
        </div>}

        {validation && validation.length > 1 && <div>
          <DialogContentText>
            Plusieurs suggestions sont disponibles pour la ville que vous avez saisie.

            Veuillez sélectionner la ville désirée.

            Néanmoins, si vous souhaitez garder la ville telle que vous avez renseignée initialement, cliquez <Link 
              href="#!"
              onClick={confirmInitial}
            >ici</Link>.
          </DialogContentText>

          <FormControl className={classes.city_control_wrapper}>
            <InputLabel id="town-city-selection">Suggestions de ville</InputLabel>
            <Select
              labelId="town-city-selection"
              value={suggested ? suggested : validation[0]}
              onChange={evt => setSuggested(evt.target.value as string)}
            >
              {validation.map(town => <MenuItem value={town} key={town}>{town}</MenuItem>)}
            </Select>
          </FormControl>
        </div>}
      </DialogContent>

      <DialogActions style={{ justifyContent: 'space-between' }}>
        <Button color="primary" onClick={props.onClose}>
          Annuler
        </Button>

        {!validation && ""}
        
        {validation && validation.length === 0 && <Button className="button-green" onClick={confirmInitial}>
          Valider
        </Button>}

        {validation && validation.length > 0 && <Button className="button-green" onClick={confirmSelection}>
          Valider
        </Button>}
      </DialogActions>
    </Dialog>
  )
}
