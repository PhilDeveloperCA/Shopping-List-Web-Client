import {useEffect, useState} from 'react';
import React from 'react';
import axios from 'axios';
import { useRouteMatch, useParams, useLocation, useHistory } from 'react-router';
import { AuthContext } from '../auth_context';
//Lists of Shopping List in That Group 

const Group:React.FC = () => {
    const [shoppinglistname, setShoppingListName] = useState<undefined|string>();
    const [shoppingLists, setShoppingLists] = useState<any>();
    const [selectedShoppingList, setShoppingListSelection] = useState<any>();

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
        await axios.get(`${me}/lists/create/${id}`, {
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
            }
            else return;
        }
        FetchShoppingLists();
    }, [])

    const addList = async () => {
        const response = await axios.get(`${me}/lists/create/${id}`,{
            headers: {
                Authorization : state.token,
            },
            params : {
                shoppinglistname
            }
        })
    }

    const deleteList = async () => {
        await axios.get(`${me}/lists/${selectedShoppingList}`,{
            headers: {
                Authorization: state.token
            }
        });
    }

    const inviteUser = async () => {
        axios.get(`${me}/group/invite/send/${id}`,{
            params : {
                username : inviteUsername,
            },
            headers : {
                Authorization: state.token
            }
        })
        .then(response => console.log(response))
        .catch(err => console.log(err));
    }
 
    const ShoppingListRows = shoppingLists?.map((list:any,index:number) => {
        return(
            <div className="Shopping-List-Div">
                <h2> {list.name} {selectedShoppingList === list.id? '- SELECTED' : ''} </h2>
                <button onClick={(event) => {event.preventDefault(); setShoppingListSelection(list.id)}}>  Select List </button>
                <button onClick = {() => history.push(`/group/${id}/shoppinglist/${list.id}`) }> Visit Shopping List </button>
            </div>
        );
    })

    return (
    <div>
        <h1> Group Shopping List </h1>
        {ShoppingListRows}

        <div>
                <h1> Create Shopping List </h1>
                <form>
                    <label htmlFor = "list"> Add Shopping List : </label>
                    <input className="class" onChange={(event) => {handleShoppinglistNameChange(event.target.value)}}/>
                    <button onClick={createShoppingList}> Add List : </button>
                </form>
                <h1> Invite Users </h1>
                <label htmlFor="inviteusername"></label>
                <input id="inviteusername" onChange={(e)=>setInviteUsername(e.target.value)}/>
                <button onClick={(event) => {event.preventDefault(); inviteUser()}}/>
            </div>
    </div>
    );
}

export default Group;