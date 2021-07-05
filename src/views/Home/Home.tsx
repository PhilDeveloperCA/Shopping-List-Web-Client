import React from 'react';
import {useState, useEffect, createContext} from 'react';
import axios from 'axios';
import {AuthContext} from '../../auth_context';
import {useHistory} from 'react-router-dom';
//import Button from '@material-ui/core/Button';
//import Grid from '@material-ui/core/Grid';
import GroupIcon from '@material-ui/icons/Group';
import DetailsIcon from '@material-ui/icons/Details';
import DeleteIcon from '@material-ui/icons/Delete';
import Box from '@material-ui/core/Box';

import {Typography, Button, Grid, ButtonGroup, Container, makeStyles, TextField, Card,  Paper, CardContent, CardActions} from '@material-ui/core';

const useStyles = makeStyles({
    btn : {
        fontSize:60,
        backgroundColor: 'violet',
        '&:hover' : {
            backgroundColor: 'blue'
        }
    },
    title : {
        textDecoration: 'underline',
        marginbottom : 20.0, 
    },
    field : {
        marginTop : 20,
        marginBottom : 20,
        display: 'block',
        color : "violet"
    },
    Group_List : {
        backgroundColor : '#f9f9f9f9',
    },
    form : {
        justify : 'center',
        alignItems : 'center',
        align : 'center'
    },
})

const GroupEntry:React.FC = () => {
    return <div> </div>
}

const Home:React.FC = () => {

    const classes = useStyles();

    const [groupname, setGroupName] = useState<string|undefined>();
    const [groups, setGroups] = useState<any>([]);
    const [selectedGroup, setSelectedGroup] = useState<undefined|number>();
    const [groupNameError, setGroupnameError] = useState<string|null>(null);
    const [invites, setInvites] = useState<any>();
    
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [login, setLogin] = useState<boolean>(true);

    const [usernameError, setUsernameError] = useState<string|null>(null);
    const [passwordError, setPasswordError] = useState<string|null>(null);
    
    const {state, dispatch} = React.useContext(AuthContext);
    const history = useHistory();

    const instance = axios.create({
        baseURL : process.env.REACT_APP_API_URL,
        timeout : 1000,
        headers : {
            'Authorization' : state.token,
        }
    })

    let api_url = process.env.REACT_APP_API_URL;

    const handleGroupnameChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(event.target.value);
    }

    useEffect(() => {
        const FetchGroups = async () => {
            instance.get('/app/group')
                .then(response => {
                    setGroups(response.data);
                })
                .catch(err => {
                    console.log(err);
                    /*dispatch({
                        type: 'logout'
                    })*/
                })
        }
        if(state.token) FetchGroups();
    },[state.token]);

    const getUsers = async (id:number) => {
        const group = groups.find((element:any) => element.id === id);
        var names = groups.users || null;
        if(names) return;
        axios.get(`${api_url}/group/users/${id}`)
        .then(response => {
            const users = response.data;
            group.users = users;
        })
    }

    const SubmitGroup = async (event:any) => {
        event.preventDefault();
        if(groupname === undefined || groupname === '' || groupname === null) return setGroupnameError('Enter a Valid Group Name');
        instance.post('/app/group', {
            name: groupname,
        })
        .then(response => setGroups([...groups, response.data[0]]))
        .catch(err => console.log(err));
    }

    const Login = async (event:any) => {
        event.preventDefault();
        if(username === '') return setUsernameError('Enter a Valid Username');
        if(password === '') return setPasswordError('Enter a Valid Password')

        axios.post(`${api_url}/auth/signin`,
            {
                username,
                password
            }            
        )
        .then(response => 
            dispatch({
                type: 'login',
                payload: {
                    user: response.data.username,
                    token:response.data.jwt,
                }
            })
        )
        .catch(err => {
            console.log(err);
            setPasswordError('Invalid Username or Password')
            setUsernameError('Invalid Username or Password')
        });
    }

    const Signup = async (event:any) => {
        event.preventDefault();
        console.log('here trying');
        if(username === '' || username === null) return setUsernameError('Enter a Valid Username');
        if(password === ''|| password === null) return setPasswordError('Enter a Valid Password')
        if(confirmPassword != password) return setPasswordError('Passwords Do Not Match');
        console.log({username,password})
        axios.post(`${api_url}/auth/signup`,
            {
                username,
                password
            },
            {
                validateStatus: function(status){
                    return status >= 200 && status < 300;
                }
            }          
        )
        .then(response => 
            dispatch({
                type: 'login',
                payload: {
                    user: response.data.user[0].username,
                    token:response.data.jwt,
                }
            })
        )
        .catch(err =>  {
            console.log(err);
            setUsernameError('Username Already in Use');
        });
    }

    const SubmitAuth = (event:any) => {
        if(login){
            Login(event);
        }
        else Signup(event);
    }

    const handleGroupSelection = (id:any) => {
        setSelectedGroup(id);
    }

    const deleteGroup = (event:any, groupid:number) => {
        event.preventDefault();
        /*axios.get(`${api_url}/group/delete/${groupid}`, {
            headers : {
                Authorization : state.token, 
            }
        })*/
        instance.delete(`app/group/${groupid}`)
            .then(response => {
                console.log(response);
            })
            .catch(err => console.log(err));
    }

    const acceptInvite = (event:any,id:number) => {
        event.preventDefault();
        axios.get(`${api_url}/group/invite/accept/${id}`, {
            headers:{
                Authorization: state.token,
            },
        })
    }

    const deleteInvite = (event:any,id:number) => {
        event.preventDefault();
        axios.get(`${api_url}/group/invite/reject/${id}`, {
            headers : {
                Authorization : state.token
            }
        })
    }

    const GroupList:any = groups?.map((group:any,index:any) => {
        if(true){
            return(
                <Grid item sm={9} md={6} lg={4}>
                    <Card style={{minHeight:'250px', padding:'30px', alignItems:'center', backgroundColor:'whitesmoke', display:'flex', justifyContent:'flex-start', flexDirection:'column'}}>
                        <CardContent >
                            <Typography variant="h5"> {group.name} </Typography>
                        </CardContent>
                        <CardActions>
                            <ButtonGroup
                            color = "primary"
                            variant = "contained"
                             >
                                <Button 
                                    startIcon = {<DetailsIcon/>}
                                    onClick = {() => handleGroupSelection(group.id)}
                                >
                                    See Group Details 
                                </Button>
                                <Button
                                    endIcon = {<DeleteIcon />}
                                    onClick = {(e) => {deleteGroup(e, group.id)}}
                                >
                                    Delete Group 
                                </Button>
                                <Button
                                    endIcon = {<GroupIcon />}
                                    onClick= {() => history.push(`/group/${group.id}`)}
                                >
                                    Visit Group Page
                                </Button>  
                            </ButtonGroup>
                        </CardActions>
                    </Card>
                </Grid>
            );
        }
        return(
        <Grid item sm={9} md={6} lg={4} className = {classes.Group_List}>
                <Box className={classes.Group_List} m={2} pt={3}>
                    <Typography 
                        color = "secondary"
                        variant = "h4"
                        align = "center"
                    >
                        {group.name}{selectedGroup===group.id?'-':''}
                    </Typography>
                    <ButtonGroup
                        color = "primary"
                        variant = "contained"
                    >
                        <Button 
                            startIcon = {<DetailsIcon/>}
                            onClick = {() => handleGroupSelection(group.id)}
                        >
                            See Group Details 
                        </Button>
                        <Button
                            endIcon = {<DeleteIcon />}
                            onClick = {(e) => {deleteGroup(e, group.id)}}
                        >
                            Delete Group 
                        </Button>
                        <Button
                            endIcon = {<GroupIcon />}
                            onClick= {() => history.push(`/group/${group.id}`)}
                        >
                            Visit Group Page
                        </Button>  
                    </ButtonGroup>
                </Box>
                <div className={selectedGroup === group.id?'members-active':'members'}> {
                        //name.map((member,index) => <li className="members"> {member}</li>)
                    }
                </div>
        <div>
                
            </div> 
        </Grid>
        );
    })

    if(!state.user || !state.token) return (
            <Container className ={classes.form}>
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
                        className = {classes.field}
                        label = "Enter Username"
                        variant = "outlined"
                        color = "primary"
                        required
                        error = {usernameError != null? true:false}
                        helperText={usernameError}
                        onChange ={(e) => {setUsername(e.target.value)}}
                    />
                    <TextField 
                        className = {classes.field}
                        label = "Enter Password"
                        variant = "outlined"
                        color = "primary"
                        required
                        error = {passwordError != null? true:false}
                        helperText={passwordError}
                        onChange ={(e) => {setPassword(e.target.value)}}
                    />
                
                {!login?<TextField 
                    className = {classes.field}
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
                    onClick = {SubmitAuth}
                > 
                    {login? 'Login': 'Sign-Up'}
                </Button>
                </form>
            </Container>
    );
    else {
        return (
            <React.Fragment>
                <Grid container style={{margin:'30px'}}>
                    <Grid item md ={6} xs={12}>
                        <Typography
                            variant = "h4"
                            color = "secondary"
                            align = "center"
                        >
                            Create Group : 
                        </Typography>
                        <form noValidate autoComplete="off"> 
                            <TextField 
                            className = {classes.field}
                            label = "Add Group"
                            variant = "outlined"
                            color = "secondary"
                            required
                            onChange = {(e) => setGroupName(e.target.value)}
                            error = {true?false:true}
                            helperText={true?null:'Enter Valid Group Name'}
                            />
                            <Button
                                variant = "outlined"
                                color = "secondary"
                                onClick = {SubmitGroup}
                            >
                                Submit :
                            </Button>
                        </form>
                    </Grid>
                    <Grid item md = {6} xs = {12} alignContent='center' alignItems='center' justify='center'>
                        <Typography
                            variant = "h5"
                            color = "secondary"
                            align = "center"
                        >
                            Invites : 
                        </Typography>
                    </Grid>
                    <Grid item lg={12} xs={12} style={{marginBottom:'50px'}}>
                        <Typography
                            variant = "h3"
                            color = "secondary"
                            align = "center"
                            >
                                Your Groups 
                    </Typography>
                    </Grid>
                        {GroupList}
                </Grid>
            </React.Fragment>
        );
    }
}


export default Home;
