import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Home from './views/Home2';
import {createContext, useState, useReducer} from 'react';
import './App.css';

import {AuthContext, authreducer, initialState, AuthProvider} from './auth_context';
import Group from './views/Group';
import ShoppingList from './views/ShoppingList';
import {createMuiTheme, ThemeProvider} from '@material-ui/core';
import {blue, purple} from '@material-ui/core/colors';
import Layout from './components/Layout';

const theme = createMuiTheme({
    palette : {
        /*primary: {
            main :  purple,
        },*/
        primary : purple,
        secondary : blue,
        
    },
    typography : {
        fontFamily: 'Quicksand'
    },
    spacing : 8.0,
})

const App = () => {;
    console.log(process.env.REACT_APP_API_URL);
    const [state,dispatch] = React.useReducer(authreducer, initialState);
    const value = {state, dispatch}
    return (
        <ThemeProvider theme={theme}>
        <AuthProvider>    
            <Router>
                <Layout>
                <Switch>
                    <Route exact path ='/' component={Home} />
                    <Route exact path='/group/:id' component={Group} />
                    <Route exact path= '/group/:id/shoppinglist/:listid' component={ShoppingList}/>
                    <Route exact path='/group/:id/shoppinglist/:listid/compute' component={Home} />
                </Switch>
                </Layout>
            </Router>
        </AuthProvider>
        </ThemeProvider>
    );
}

ReactDOM.render(
    <App />,
    document.querySelector('#root')
);

export {}
