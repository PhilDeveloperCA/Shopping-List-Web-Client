import React, {useState} from 'react';
import {AuthContext} from '../auth_context';
import axios from 'axios';
import {GoogleLogin} from 'react-google-login';

import GroupIcon from '@material-ui/icons/Group';
import DetailsIcon from '@material-ui/icons/Details';
import DeleteIcon from '@material-ui/icons/Delete';
import Box from '@material-ui/core/Box';

import {Typography, Button, Grid, ButtonGroup, Container, makeStyles, TextField, Paper} from '@material-ui/core';

type LocalLogin = {
    username : null|string,
    password : null|string,
    email : null|string,
}

type LocalLoginError = {
    username : null|string,
    password : null|string,
    email : null|string,
}

const useStyles = makeStyles((theme) => ({
    root : {
        flexGrow:1,
    }
}))

const LoginScreen:React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [login, setLogin] = useState<boolean>(true);

    const [usernameError, setUsernameError] = useState<string|null>(null);
    const [passwordError, setPasswordError] = useState<string|null>(null);
    const [localLogin, setLocalLogin] = useState<LocalLogin>({username:null, password:null, email:null});
    const [localLoginError, setLocalLoginError] = useState<LocalLoginError>({username:null, password:null, email:null})

    const {state, dispatch} = React.useContext(AuthContext);

    const client = axios.create({
        baseURL : '/api',
        timeout : 1000,
        headers : {
            'Authorization' : state.token,
        }
    })

    const classes = useStyles();

    async function Signup(e:any){
        e.preventDefault();
        if(password !== confirmPassword){
            return setLocalLoginError({...localLoginError, password:'Passwords Do Not Match'});
        }

        if(password.length < 7){
            return setLocalLoginError({...localLoginError, password:"Password Must Be At Least 7 Characters"});
        }

        axios.post('/api/auth/local-signup', {
            username,
            password
        })
        .then(response => {
            dispatch({
                type: 'login',
                payload: {
                    user: response.data.user.username,
                    token:response.data.jwt,
                }
            })
        })
        .catch(err => {
            console.log(err);
        })
    }

    async function Login (e:any){
        e.preventDefault();
        axios.post('/api/auth/signin',{
            username,
            password
        })
            .then(response => {
                dispatch({
                    type: 'login',
                    payload: {
                        user: response.data.username,
                        token:response.data.jwt,
                    }
                })
            })
            .catch(err => {
                console.log(err);
                setLocalLoginError({...localLoginError, ['password'] : 'Invalid Username or Password', ['username'] : 'Invalid Username or Password'})
            })  
    }

    return(
        <Grid container className={classes.root} spacing={2} direction="column" alignItems="center" justify="center">
        <Grid item xs={12} style={{marginBottom:'30px', marginTop:'40px'}}>
            <Typography variant = "h3"> Login / Sign-Up </Typography>
        </Grid>
        <Grid item style={{display:'flex', flexDirection:'row', alignItems:'space-around', justifyContent:'space-around'}}>
            <div style={{flexGrow:1.0, marginRight:'30px'}}> 
            <Button 
                color="primary" 
                variant="outlined" 
                size = "large"
                onClick= {(e) => {e.preventDefault(); setLogin(false)}} 
                disabled={!login}> 
                New User? Sign Up 
            </Button>
            </div>
            <div style={{flexGrow:1.0, marginLeft:'30px'}}>
            <Button 
                size="large" 
                color="primary" 
                variant="outlined" 
                onClick= {(e) => {e.preventDefault(); setLogin(true)}} 
                disabled={login}> 
                Returning ? Sign in 
            </Button>
            </div>
        </Grid>
        <Grid item>
        <TextField 
                label = "Enter Username"
                variant = "outlined"
                color = "primary"
                required
                error = {usernameError != null? true:false}
                helperText={usernameError}
                onChange ={(e) => {setUsername(e.target.value)}}
            />
        </Grid>
        <Grid item>
        <TextField 
                label = "Enter Password"
                variant = "outlined"
                color = "primary"
                required
                type="password"
                error = {localLoginError.password != null? true:false}
                helperText={localLoginError.password}
                onChange ={(e) => {setPassword(e.target.value)}}
            />
        </Grid> 
        <Grid item>
        {!login?<Grid item><TextField 
            label = "Re-Enter Password"
            variant = "outlined"
            color = "primary"
            type="password"
            required
            error = {localLoginError.password != null? true:false}
            helperText={localLoginError.password}
            onChange = {(e) => {setConfirmPassword(e.target.value)}}
        /></Grid>:null}
        </Grid>
        <Grid item>
            <Button 
                size="large" 
                color="primary" 
                variant="contained" 
                onClick = {login?Login:Signup}
            > 
                {login? 'Login': 'Sign-Up'}
            </Button>
        </Grid>
        </Grid>    
    );
}

export default LoginScreen;