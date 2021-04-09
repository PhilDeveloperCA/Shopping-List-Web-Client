import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Home from './views/Home2';
import {createContext, useState, useReducer} from 'react';
import './App.css';

import {AuthContext, authreducer, initialState, AuthProvider} from './auth_context';
import Group from './views/Group';
import ShoppingList from './views/ShoppingList';


const App = () => {;
    console.log(process.env.REACT_APP_API_URL);
    const [state,dispatch] = React.useReducer(authreducer, initialState);
    const value = {state, dispatch}
    return (
        <AuthProvider>    
            <Router>
                <Switch>
                    <Route exact path ='/' component={Home} />
                    <Route exact path='/group/:id' component={Group} />
                    <Route exact path= '/group/:id/shoppinglist/:listid' component={ShoppingList}/>
                    <Route exact path='/group/:id/shoppinglist/:listid/compute' component={Home} />
                </Switch>
            </Router>
        </AuthProvider>
    );
}

ReactDOM.render(
    <App />,
    document.querySelector('#root')
);

export {}
