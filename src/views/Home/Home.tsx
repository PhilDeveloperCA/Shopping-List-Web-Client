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
import retryRefresh from '../../util/retryRefresh';

import {Typography, Button, Grid, ButtonGroup, Container, makeStyles, TextField, Card,  Paper, CardContent, CardActions} from '@material-ui/core';
import { groupEnd } from 'node:console';

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
    
    const {state, dispatch} = React.useContext(AuthContext);
    const history = useHistory();

    const handleAuthFailure = {
        success: (response:any) => dispatch({
            type: 'login',
            payload: {
                user: response.username,
                token:response.jwt,
            }
        }),
        failure : (respone:any) => dispatch({
            type:'logout'
        })
    }

    const instance = axios.create({
        baseURL : '/api',
        timeout : 1000,
        headers : {
            'Authorization' : state.token,
        }
    })

    const handleGroupnameChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(event.target.value);
    }

    useEffect(() => {
        const FetchGroups = async () => {
            instance.get('/group')
                .then(response => {
                    setGroups(response.data);
                })
                .catch(err => {
                   retryRefresh()
                   .then(res => handleAuthFailure.success)
                   .catch(err => handleAuthFailure.failure)
                })
        }
        if(state.token) FetchGroups();
    },[state.token]);

    const getUsers = async (id:number, index:number) => {
        const group = groups.find((element:any) => element.id === id);
        var names = groups.users || null;
        if(names) return;
        instance.get(`/users?group=${id}`)
        .then(response => {
            const users = response.data;
            group.users = users;
            setGroups([...groups.slice(0,index), {...group, users: users}, ...groups.slice(index+1)]);
        })
    }

    const SubmitGroup = async (event:any) => {
        event.preventDefault();
        if(groupname === undefined || groupname === '' || groupname === null) return setGroupnameError('Enter a Valid Group Name');
        instance.post('/group', {
            name: groupname,
        })
        .then(response =>{setGroups([...groups, {...response.data[0], admin:state.user}]); setGroupName("")})
        .catch(err => {
            retryRefresh()
            .then(res => handleAuthFailure.success)
            .catch(err => handleAuthFailure.failure)
         })
    }

    const handleGroupSelection = async (id:any, index:number) => {
        setSelectedGroup(id);
        await getUsers(id,index);
    }

    const deleteGroup = (event:any, groupid:number, index:number) => {
        event.preventDefault();
        instance.delete(`group/${groupid}`)
            .then(response => {
                setGroups([...groups.slice(0,index), ...groups.slice(index+1)]);
            })
            .catch(err => {
                retryRefresh()
                .then(res => handleAuthFailure.success)
                .catch(err => handleAuthFailure.failure)
             })
    }

    const GroupList:any = groups?.map((group:any,index:any) => {
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
                                    onClick = {() => handleGroupSelection(group.id, index)}
                                >
                                    See Group Details 
                                </Button>
                                {group.admin === state.user?<Button
                                    endIcon = {<DeleteIcon />}
                                    onClick = {(e) => {deleteGroup(e, group.id, index)}}
                                >
                                    Delete Group 
                                </Button>: <Button disabled> Admin : {group.admin}</Button>}
                                <Button
                                    endIcon = {<GroupIcon />}
                                    onClick= {() => history.push(`/group/${group.id}`)}
                                >
                                    Visit Group Page
                                </Button>  
                            </ButtonGroup>
                        </CardActions>
                        {selectedGroup === group.id? <div>
                            Group-Members : {group.users?group.users.map((users:any,index:any) => {
                                return <li> {users.username}</li>;
                            }):null}
                        </div>: null}
                    </Card>
                </Grid>
            );     
    })

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
                            id="Add Group"
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


export default Home;
