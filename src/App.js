import React, { Component } from 'react';
import './App.css';
import superagent from 'superagent';
import styles from './Components/StylesMap';
import Proptypes from 'prop-types';
import GoogleMap from './Components/GoogleMap';

class App extends Component {
  render() {
    return (
      <div>
        <GoogleMap/>
      </div>
    );
  }
}

export default App;

