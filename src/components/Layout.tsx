import React from 'react';
import {makeStyles} from '@material-ui/core';
import {AuthContext} from '../auth_context';
import Button from '@material-ui/core/Button';
import {useHistory} from 'react-router-dom';

const useStyles = makeStyles({
    page : {
        background : 'black',
        width: '80%',
    }
})

const Layout:React.FC = ({children}) => {
    const {state, dispatch} = React.useContext(AuthContext);
    const history = useHistory();
    const classes = useStyles();

    const Logout = (event:any) => {
        event.preventDefault();
        dispatch({
            type:'logout'
        })
        history.push('/');
    }

    const LogoutButton = (
        <Button 
            onClick = {Logout}
            variant = "contained"
            color = "primary"
            >
            Log Out 
        </Button>
    );
    return(
        <div>
            {!state.user || !state.token?null:LogoutButton}
            {children}
        </div>
    );
}

export default Layout;