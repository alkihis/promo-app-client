import React from 'react';
import logo from '../../logo.svg';
import classes from './App.module.scss';
import Test from './Test';

const App: React.FC = () => {
  return (
    <div className={classes.App}>
      <header className={classes['App-header']}>
        <img src={logo} className={classes['App-logo']} alt="logo" />
        <p>
          Edit <code>src/components/main/App.tsx</code> and save to reload.
        </p>
        <a
          className={classes['App-link']}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <main>
        <Test name="My test" />
      </main>
    </div>
  );
}

export default App;
