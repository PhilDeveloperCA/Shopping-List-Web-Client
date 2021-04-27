import {useEffect, useState} from 'react';
import React from 'react';
import axios from 'axios';
import { useRouteMatch, useParams, useLocation, useHistory } from 'react-router';
import { AuthContext } from '../auth_context';
import Paper from '@material-ui/core/Paper';
import {Typography, Button, Grid, ButtonGroup, Container, makeStyles, TextField, IconButton} from '@material-ui/core';
//Lists of Shopping List in That Group 
import DetailsIcon from '@material-ui/icons/Details';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteIcon from '@material-ui/icons/Delete';
import {red} from '@material-ui/core/colors';

const useStyles = makeStyles({
    shopping_list : {
        backgroundColor : '#f9f9f9f9',
        border: 10,
    },
    title : {
        marginTop : 20,
        marginBottom : 20,
        align : 'center'
    },
    formlabel : {
        marginBottom: 10,
        marginTop : 20
    },
    btn : {
        marginLeft : 30
    },
    btn2 : {marginTop : 20}
})

const Group:React.FC = () => {
    const [shoppinglistname, setShoppingListName] = useState<undefined|string>();
    const [shoppingLists, setShoppingLists] = useState<any>();
    const [selectedShoppingList, setShoppingListSelection] = useState<any>();
    const [listNameError, setListNameError] = useState<null|string>(null);
    const [users, setUsers] = useState<any>([]);
    const [nameError, setNameError] = useState<null|string>(null);
    const classes = useStyles();

    const [inviteUsername, setInviteUsername] = useState<string|undefined>();

    const {state, dispatch} = React.useContext(AuthContext);

    let history = useHistory();
    let match = useRouteMatch();
    let location = useLocation();
    const {id} = useParams<{id:string|undefined}>();

    let me = process.env.REACT_APP_API_URL;

    const handleShoppinglistNameChange = (name:string) => {
        if(name != undefined){
            setShoppingListName(name);
        }
    }

    const createShoppingList = async (event:any) => {
        event.preventDefault();
        console.log(shoppinglistname);
        if(shoppinglistname === '' || shoppinglistname === null) return setListNameError('Enter a Valid Name');
        else await axios.get(`${me}/lists/create/${id}`, {
            headers : {
                Authorization : state.token
            },
            params : {
                name : shoppinglistname,
            }
        })
    }

    useEffect(() => {
        const FetchShoppingLists = async () => {
            if(true){
                const response = await axios.get(`${me}/lists/get/${id}`, {
                    headers : {
                        Authorization : state.token,
                    },
                })
                setShoppingLists(response.data);
                const responseUsers = await axios.get(`${me}/group/users/${id}`, {
                    headers: {
                        Authorization : state.token
                    }
                })
                setUsers(responseUsers.data);
            }
            else return;
        }
        FetchShoppingLists();
    }, [])

    const addList = async (event:any) => {
        event.preventDefault();
        console.log(shoppinglistname);
        if(shoppinglistname === '' || shoppinglistname ===  undefined) return setListNameError('Enter a Valid Name');
        try{
            const response = await axios.get(`${me}/lists/create/${id}`,{
                headers: {
                    Authorization : state.token,
                },
                params : {
                    name: shoppinglistname
                }
            })
            setShoppingLists([...shoppingLists, response.data[0]]);
            console.log(shoppingLists);
        }
        catch(err){
            console.log(err);
        }
    }

    const deleteList = async (index:number, shoppingListId:number) => {
        await axios.get(`${me}/lists/delete/${shoppingListId}`,{
            headers: {
                Authorization: state.token
            }
        });
        setShoppingLists([...shoppingLists.slice(0,index),...shoppingLists.slice(index+1)]);
    }

    const inviteUser = async () => {
        if(inviteUsername === undefined || inviteUsername === null || inviteUsername === '') return setNameError('Enter a Valid Username')
        axios.get(`${me}/group/invite/send/${id}`,{
            params : {
                username : inviteUsername,
            },
            headers : {
                Authorization: state.token
            }
        })
        .then(response => console.log(response))
        .catch(err => {
            console.log(err);
            setNameError('User Does Not Exist, Enter a Valid Name');
        });
    }
 
    const ShoppingListRows = shoppingLists?.map((list:any,index:number) => {
        return(
            <Grid item className={classes.shopping_list} xs={12} sm={6} lg={4}>
                <Container>
                    <Typography variant="h4" color = "primary" className = {classes.title}>
                        {list.name} {selectedShoppingList === list.id? '-' : ''}
                    </Typography>
                    <Button
                        variant = "contained"
                        color = "secondary"
                        startIcon = {<DetailsIcon />}
                        onClick = {(event) => {event.preventDefault(); setShoppingListSelection(list.id)}}>
                        See List Details 
                    </Button>
                    <Button
                        className = {classes.btn}
                        variant = "contained"
                        color = "secondary"
                        startIcon = {<ShoppingCartIcon />}
                        onClick =  {() => history.push(`/group/${id}/shoppinglist/${list.id}`) }>
                        Visit Shopping List Page 
                    </Button>
                    <IconButton 
                        color= "inherit"
                        onClick = {(e) => {e.preventDefault(); deleteList(index, list.id)}}
                    > <DeleteIcon /> </IconButton>
                </Container>
            </Grid>
        );
    })

    return (
        <Grid container>
              <Grid item xl ={12} xs={12}>
                    <Button
                    onClick = {(e) => {e.preventDefault(); history.push('/')}}
                    startIcon = {<ArrowBackIcon />}
                    className = {classes.btn2}
                    >
                        Back to Group 
                    </Button>
                </Grid>
            <Grid item sm={12} md={6}>
                <Container>
                    <Typography variant="h5" align="left" className ={classes.formlabel}>
                        Invite Users To Group : 
                    </Typography>
                    <TextField 
                        label = "Username :  "
                        variant = "outlined"
                        color = "primary"
                        required
                        error = {nameError!= null? true:false}
                        helperText={nameError}
                        onChange={(e)=>setInviteUsername(e.target.value)}/>
                    <Button onClick={(event) => {event.preventDefault(); inviteUser()}} color = "primary">
                        Invite User 
                    </Button>
                </Container>
            </Grid>
            <Grid item sm={12} md={6} justify='center'>
                <Typography variant="h5" align="left" className = {classes.formlabel}>
                        Create Shopping List : 
                </Typography>
                <TextField 
                    label = "Enter A List Name "
                    variant = "outlined"
                    color = "primary"
                    required
                    error = {listNameError!= null? true:false}
                    helperText={listNameError}
                    onChange={(event) => {handleShoppinglistNameChange(event.target.value)}}
                />
                <Button
                    onClick={addList}
                    color = "primary"
                    size="small"
                >
                    Submit List 
                </Button> 
            </Grid>
            <Grid item xs={12} lg = {12}>
                <Typography
                    variant = "h3"
                    color = "primary"
                    align = "center"
                    className = {classes.title}
                >   
                    Groups Shopping Lists: 
                </Typography>
            </Grid>
            {ShoppingListRows}
        </Grid>
    );
}

export default Group;