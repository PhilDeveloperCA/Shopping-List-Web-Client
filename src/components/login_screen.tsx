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
        baseURL : process.env.REACT_APP_API_URL,
        timeout : 1000,
        headers : {
            'Authorization' : state.token,
        }
    })
    
    const api_url = process.env.REACT_APP_API_URL;

    const googleError = () => alert('Google Sign In was Unsuccessful')

    const handleChange = (e:any, name:string) => {
        setLocalLogin({...localLogin, [name] : e.target.value})
    }

    async function Signup(e:any){
        e.preventDefault();
        client.post('/auth/local-signup', {
            username : localLogin['username'],
            password : localLogin['password'],
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
        })
    }

    async function Login (e:any){
        e.preventDefault();
        client.post('/auth/signin',{
            //username : localLogin['username'],
            //password : localLogin['password'],
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
<           Container>
                <Typography
                    variant = "h3"
                >
                    Login / Sign-Up Page 
                </Typography>
                <GroupIcon fontSize = "large" color="secondary" />
                <Button 
                    color="primary" 
                    variant="contained" 
                    size = "large"
                    onClick= {(e) => {e.preventDefault(); setLogin(false)}} 
                    disabled={!login}> 
                    New User? Sign Up 
                </Button>
                <Button 
                    size="large" 
                    color="primary" 
                    variant="contained" 
                    onClick= {(e) => {e.preventDefault(); setLogin(true)}} 
                    disabled={login}> 
                    Returning ? Sign in 
                </Button>
                <form noValidate autoComplete="off"> 
                    <TextField 
                        label = "Enter Username"
                        variant = "outlined"
                        color = "primary"
                        required
                        error = {usernameError != null? true:false}
                        helperText={usernameError}
                        onChange ={(e) => {setUsername(e.target.value)}}
                    />
                    <TextField 
                        label = "Enter Password"
                        variant = "outlined"
                        color = "primary"
                        required
                        error = {passwordError != null? true:false}
                        helperText={passwordError}
                        onChange ={(e) => {setPassword(e.target.value)}}
                    />
                
                {!login?<TextField 
                    label = "Re-Enter Password"
                    variant = "outlined"
                    color = "primary"
                    required
                    error = {passwordError != null? true:false}
                    helperText={passwordError}
                    onChange = {(e) => {setConfirmPassword(e.target.value)}}
                />:null}

                <Button 
                    size="large" 
                    color="primary" 
                    variant="contained" 
                    onClick = {login?Login:Signup}
                > 
                    {login? 'Login': 'Sign-Up'}
                </Button>
                </form>
            </Container>    
    );
}

export default LoginScreen;