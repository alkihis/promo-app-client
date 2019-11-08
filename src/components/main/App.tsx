import React from 'react';
import classes from './App.module.scss';
import AppRouter from '../Router/Router';
import Toaster from '../shared/Toaster/Toaster';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#d84315',
    },
    secondary: {
      main: '#ec8f00',
    },
  }
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.App}>
        <AppRouter />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
