import React from 'react';
import { Formation } from '../../../../interfaces';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from '@material-ui/core';

type FMProps = {
  onClose?: () => void;
  onConfirm?: (form: Formation) => void;
  open?: boolean;
  base?: Formation;
}

export default class FormationModal extends React.Component<FMProps> {
  makeConfirm = () => {

  };

  render() {
    return (
      <Dialog open={this.props.open!} onClose={this.props.onClose}>
        <DialogTitle>Formation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates
            occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.makeConfirm} color="primary">
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export const FormationResume: React.FC<{ onLinkClick?: () => void, formation?: Formation }> = props => {
  return (
    <div>
      {props.formation ? 
      <div>
        <pre>{JSON.stringify(props.formation)}</pre>  
      </div> :
      <div>
        Aucune formation n'est actuellement entrée.
      </div>
      }

      <Button color="primary" onClick={props.onLinkClick}>
        Modifier
      </Button>
    </div>
  );
};
