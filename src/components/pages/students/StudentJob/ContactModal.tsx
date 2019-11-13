import React from 'react';
import { Company, Contact } from '../../../../interfaces';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, Typography } from '@material-ui/core';
import classes from './Modals.module.scss';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Marger, notifyError } from '../../../../helpers';
import APIHELPER from '../../../../APIHelper';
import { toast } from '../../../shared/Toaster/Toaster';

type CMProps = {
  onClose?: () => void;
  onConfirm?: (form?: Contact) => void;
  open?: boolean;
  company: Company;
  base?: Contact;
}

type CMState = {
  available?: Contact[];
  selected?: Contact;
  name?: string;
  email?: string;
};

// Returned by make confirm is a unsended contact (id=0) to create or a already created (id>0)
export default class ContactModal extends React.Component<CMProps, CMState> {
  constructor(props: CMProps) {
    super(props);

    this.state = {
      name: "",
      email: ""
    };
  }

  componentDidMount() {
    this.refreshContacts();
    this.buildFromContactBase();
  }

  componentDidUpdate(old_props: CMProps) {
    if (this.props.company !== old_props.company) {
      this.refreshContacts();
    }
    if (this.props.open !== old_props.open) {
      // Reset
      this.setState({
        name: "",
        email: "",
        selected: undefined,
      });

      if (this.props.open) {
        this.buildFromContactBase();
      }
    }
  }

  buildFromContactBase() {
    if (this.props.base) {
      const b = this.props.base;
      this.setState({
        selected: b,
        name: b.name,
        email: b.email
      });
    }
  }

  refreshContacts() {
    if (!this.props.company) {
      this.setState({
        available: undefined
      });
      return;
    }

    APIHELPER.request('contact/all', { 
      parameters: { company: this.props.company.id } 
    })
      .then((c: Contact[]) => {
        this.setState({
          available: c
        });
      })
      .catch(e => {
        this.setState({
          available: undefined
        });
        notifyError(e);
      });
  }

  makeConfirm = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();

    let is_same = false;
    if (this.state.selected) {
      if (this.state.selected.name === this.state.name && this.state.selected.email === this.state.email) {
        is_same = true;
      }
    } 

    if (!this.state.name || !this.state.email) {
      if (!this.state.name && !this.state.email) {
        this.props.onConfirm?.();
        return;
      }
      toast("Vous ne pouvez pas sauvegarder un contact incomplet.", "warning");
      return;
    }

    const contact: Contact = {
      id: is_same ? this.state.selected!.id : 0,
      name: this.state.name!,
      email: this.state.email!,
      linked_to: this.props.company.id
    };

    this.props.onConfirm?.(contact);
  };

  handleEmailChange = (evt: any, value: any) => {
    const email = typeof value === 'string' ? value : evt?.target?.value;

    //// TODO Do things like auto set the town !
    let associated_company: Contact = undefined!;

    if (this.state.available) {
      for (const c of this.state.available) {
        if (c.email === email) {
          associated_company = c;
          break;
        }
      }

      if (associated_company) {
        console.log("contact found", associated_company)
        this.setState({
          email,
          selected: associated_company,
          name: associated_company.name,
        });
        return;
      }
    }
    
    this.setState({
      email,
      selected: undefined
    });
  };

  handleNameChange = (evt: any) => {
    const name = evt.target.value;
    this.setState({
      name
    });
  }

  render() {
    return (
      <Dialog open={this.props.open!} onClose={this.props.onClose}>
        <DialogTitle>Contact</DialogTitle>
        <form onSubmit={this.makeConfirm}>
          <DialogContent>
            <DialogContentText>
              Votre contact dans l'entreprise {this.props.company?.name}.
            </DialogContentText>
            <ContactEmailSelect 
              value={this.state.email}
              onChange={this.handleEmailChange}
              onInputChange={this.handleEmailChange}
              options={this.state.available?.map(e => e.email)}
            />

            <Marger size=".5rem" />

            <TextField 
              disabled={!!this.state.selected && this.state.selected.id !== 0}
              value={this.state.name}
              onChange={this.handleNameChange}
              required
              variant="outlined"
              fullWidth
              label="Nom du contact"
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

function ContactEmailSelect(props: { 
  onChange: (event: React.ChangeEvent<{}>, value: any) => void, 
  value?: string,
  options?: string[],
  onInputChange: any
}) {
  const [open, setOpen] = React.useState(false);
  const loading = open && !props.options;

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
      options={options}
      loading={loading}
      loadingText={"Chargement..."}
      noOptionsText={"Aucun email à suggérer"}
      onChange={props.onChange}
      value={props.value ?? ""}
      autoComplete
      freeSolo
      clearOnEscape={false}
      renderInput={params => (
        <TextField
          {...params}
          label="Email du contact"
          fullWidth
          required
          type="email"
          onChange={props.onInputChange}
          variant="outlined"
        />
      )}
    />
  )
}

export const ContactResume: React.FC<{ onLinkClick?: () => void, contact?: Contact, disabled?: boolean }> = props => {
  return (
    <div>
      {props.contact ? 
      <div>
        <Typography variant="h5">
          {props.contact.name}
        </Typography>
        <Typography variant="h6">
          {props.contact.email}
        </Typography>
      </div> :
      <div>
        Aucun contact n'est actuellement entré.
      </div>
      }

      <Button color="primary" className={classes.enter_button} onClick={props.onLinkClick} disabled={props.disabled}>
        Modifier
      </Button>
    </div>
  );
};
