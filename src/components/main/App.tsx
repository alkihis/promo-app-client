import React from 'react';
import logo from '../../logo.svg';
import classes from './App.module.scss';
import Test from './Test';
import AppRouter from '../Router/Router';
import Toaster from '../shared/Toaster/Toaster';

const App: React.FC = () => {
  return (
    <div className={classes.App}>
      <AppRouter />
      <Toaster />
    </div>
  );
}

export default App;
