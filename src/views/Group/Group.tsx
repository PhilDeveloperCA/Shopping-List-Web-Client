import {useEffect, useState} from 'react';
import React from 'react';
import axios from 'axios';
import { useRouteMatch, useParams, useLocation, useHistory } from 'react-router';
import { AuthContext } from '../../auth_context';
import Paper from '@material-ui/core/Paper';
import {Typography, Button, Grid, ButtonGroup, Container, makeStyles, TextField, IconButton,Card,CardContent, CardActions, Modal} from '@material-ui/core';
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
    const [showModal, setModal] = useState<boolean>(false);

    const [inviteUsername, setInviteUsername] = useState<string|undefined>();

    const {state, dispatch} = React.useContext(AuthContext);

    let history = useHistory();
    const {id} = useParams<{id:string|undefined}>();

    const handleShoppinglistNameChange = (name:string) => {
        if(name != undefined){
            setShoppingListName(name);
        }
    }

    useEffect(() => {
        const FetchShoppingLists = async () => {
            if(true){
                const response = await axios.get(`/api/lists/?group=${id}`, {
                    headers : {
                        Authorization : state.token,
                    },
                })
                setShoppingLists(response.data);
                const responseUsers = await axios.get(`/api/users?group=${id}`, {
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
            const response = await axios.post(`/api/lists/${id}`, 
            {
                name:shoppinglistname
            }, 
            {
                headers: {Authorization : state.token}
            }
            )
            setShoppingLists([...shoppingLists, response.data[0]]);
            setShoppingListName('');
            console.log(shoppingLists);
        }
        catch(err){
            console.log(err);
        }
    }

    const deleteList = async (index:number, shoppingListId:number) => {
        axios.delete(`/api/lists/${shoppingListId}`,{
            headers: {
                Authorization: state.token
            }
        })
        .then(res => {
            setShoppingListSelection(undefined);
            setShoppingLists([...shoppingLists.slice(0,index),...shoppingLists.slice(index+1)]);
        }).catch(err => {
            console.log(err);
        }) 
    }

    const inviteUser = async () => {
        if(inviteUsername === undefined || inviteUsername === null || inviteUsername === '') return setNameError('Enter a Valid Username')
        axios.post(`/api/invite`,{
            username: inviteUsername,
            groupid : id
        },
        {
            headers : {
                Authorization: state.token
            }
            }
        )
        .then(response => setNameError(null))
        .catch(err => {
            console.log(err);
            setNameError('User Does Not Exist, Enter a Valid Name');
        });
    }

    const modal =  (
        shoppingLists&&(selectedShoppingList+1)
        ?<Modal open={showModal} onClose={() => {setModal(false)}} aria-labelledby='simple-modal-title' aria-describedby = 'simple-modal-description' style={{display : 'flex', alignItems : 'center', margin:'auto', alignContent:'center', maxWidth:'400px', justifyContent:'center'}}> 
            {<Container>
                <Card>
                    <CardContent>
                        <Typography > 
                            {shoppingLists[selectedShoppingList]? `Would You Like To Permanently Delete the ${shoppingLists[selectedShoppingList].name} list ?`:null }
                        </Typography>
                    </CardContent>
                    <CardActions style={{display:'flex', justifyContent:'space-around'}}>
                        <Button onClick = {(e) => {e.preventDefault(); setModal(false)}}>
                            No 
                        </Button>
                        <Button onClick = {(e) => {e.preventDefault(); setShoppingListSelection(null); setModal(false); deleteList(selectedShoppingList, shoppingLists[selectedShoppingList].id)}}>
                            Yes 
                        </Button>
                    </CardActions>
                </Card>    
            </Container>}
        </Modal>:<div></div>
    );
 
    const ShoppingListRows = shoppingLists?.map((list:any,index:number) => {
        return(
            <Grid item className={classes.shopping_list} xs={12} sm={6} lg={4}>
                <Container>
                    <Card style={{justifyContent: 'center', display : 'flex'}}>
                    <CardContent style={{justifyContent: 'center'}}>
                    <Typography variant="h4" color = "primary" className = {classes.title}>
                        {list.name} {selectedShoppingList === list.id? '-' : ''}
                    </Typography>
                    <ButtonGroup variant="contained" color="secondary" orientation="vertical"> 
                    <Button
                        startIcon = {<DetailsIcon />}
                        onClick = {(event) => {event.preventDefault(); setShoppingListSelection(list.id)}}>
                        See List Details 
                    </Button>
                    <Button
                        startIcon = {<ShoppingCartIcon />}
                        onClick =  {() => history.push(`/group/${id}/shoppinglist/${list.id}`) }>
                        Visit Shopping List Page 
                    </Button>
                    <IconButton 
                        color= "inherit"
                        onClick = {(e) => {e.preventDefault(); setShoppingListSelection(index); console.log(selectedShoppingList); console.log(shoppingLists); console.log(shoppingLists&&(selectedShoppingList+1)?true:false); setModal(true)}}>
                    <DeleteIcon /> </IconButton>
                    </ButtonGroup>
                    </CardContent>
                    </Card> 
                </Container>
            </Grid>
        );
    })

    return (
        <Grid container spacing = {2}>
            {modal}
              <Grid item xl ={12} xs={12}>
                    <Button
                    onClick = {(e) => {e.preventDefault(); history.push('/')}}
                    startIcon = {<ArrowBackIcon />}
                    className = {classes.btn2}
                    >
                        Back to Home 
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
                <Container>
                    <div>
                        <h1> Current Users: </h1>
                        {users.map((user,index) => <h1> {user.username} </h1>)}
                    </div>
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