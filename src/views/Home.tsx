import axios from 'axios';
import React from 'react';
import {useState, useEffect, useContext} from 'react';
import { Link, useHistory } from 'react-router-dom';
import {AuthContext, authreducer, initialState} from '../auth_context';

//Login/Signin Toggle

//GroupLists 

//Depending on logout state -- logout 

const Home:React.FC = () => {
    const [username, setUsername] = useState<string|undefined>();
    const [password, setPassword] = useState<string|undefined>();
    const [groupname, setGroupName] = useState<string|undefined>();
    const [jwt, setJwt] = useState<string|null>(null);
    const [groups, setGroups] = useState<any>([]);
    const [selectedGroup, setSelectedGroup] = useState<undefined|number>();
    const [shoppinglistname, setShoppingListName] = useState<undefined|string>();
    const [shoppingLists, setShoppingLists] = useState<any>();
    const [selectedShoppingList, setShoppingListSelection] = useState<any>();
    const [itemName,setItemName] = useState<undefined|string>();
    const [itemDescription, setItemDescription] = useState<undefined|string>();
    const [items, setItems] = useState<any>();

    let me = process.env.REACT_APP_API_URL;

    const Names : String[] = ['Phillip', 'Kyle', 'Patrick', 'Garfield'];

    let history = useHistory();

    const {state, dispatch} = React.useContext(AuthContext);

    useEffect(() => {
        const initialJwt:string|null = localStorage.getItem('token');
        setJwt(initialJwt);  
    }, [])

    const Signout = () => {
        localStorage.removeItem('jwt');
        setJwt('');
    }

    useEffect(() => {
        const FetchGroups = async () => {
            if(jwt){
            const response = await axios.get(`${me}/group/group/mygroups`, {
                headers: {
                    Authorization : jwt
                },
            })
            setGroups(response.data);
        }
        else return; 
        }
        FetchGroups();
    }, [jwt]);

    useEffect(() => {
        const FetchShoppingLists = async () => {
            if(jwt && selectedGroup){
                const response = await axios.get(`${me}/lists/get/${selectedGroup}`, {
                    headers : {
                        Authorization : jwt,
                    },
                })
                setShoppingLists(response.data);
            }
            else return;
        }
        FetchShoppingLists();
    }, [selectedGroup])

    useEffect(() => {
        const FetchItems = async () => {
            if(jwt && selectedGroup && selectedShoppingList){
                const response = await axios.get(`${me}/items/get/${selectedShoppingList}`,{
                    headers:{
                        Authorization : jwt
                    }
                })
                setItems(response.data);
            }
        }
        FetchItems();
    }, [selectedShoppingList])

    const ItemRows = items?.map((item:any, index:number) => {
        return (
            <div>
                <h3>{item.name} - {item.creator}</h3>
                <button onClick={(event)=>deleteItem(event,item.id)}> Delete Item </button>
            </div>
        );
    })

    const ShoppingListRows = shoppingLists?.map((list:any,index:number) => {
        return(
            <div>
                <h2> {list.name} {selectedShoppingList === list.id? '- SELECTED' : ''} </h2>
                <button onClick={(event) => {event.preventDefault(); setShoppingListSelection(list.id)}}>  Select List </button>
            </div>
        );
    })

    const handleShoppinglistNameChange = (name:string) => {
        if(name != undefined){
            setShoppingListName(name);
        }
    }


    const handleItemNameChange = (event:any) => {
        if(event.target.value != undefined){
            setItemName(event.target.value);
        }
    }

    const handleItemDescriptionChange = (event:any) => {
        if(event.target.value != undefined){
            setItemDescription(event.target.value);
        }
    }

    const handleItemSubmit = () => {
        axios.get(`${me}/items/add/${selectedGroup}`);
    }

    const handleUsernameChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    }

    const handlePasswordChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }

    const handleGroupnameChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(event.target.value);
    }

    const SubmitGroup = async (event:any) => {
        event.preventDefault();
        axios.get(`${me}/group/create`, {
            params: {
                name : groupname
            },
            headers : {
                Authorization : state.token
            }
        }, 
        )
        .then(response => console.log(response));
    }


    const handleGroupSelection = (id:any) => {
        setSelectedGroup(id);
    }

    const Submit = async (event:any) => {
        event.preventDefault();
        axios.post(`${me}/auth/signup`,
            {
                username,
                password
            }
            
        )
        .then(response => console.log(response.data));
    }

    const deleteGroup = async(event:any, groupid:number) => {
        event.preventDefault();
        await axios.get(`${me}/group/delete/${groupid}`, {
            headers : {
                Authorization : state.token, 
            }
        })
    }

    const deleteItem = async(event:any, itemid:number) => {
        event.preventDefault();
        await axios.get(`${me}/items/delete/${itemid}`, {
            headers : {
                Authorization: jwt,
            }
        })
    }

    const Submit2 = async (event:any) => {
        event.preventDefault();
        axios.post(`${me}/auth/signin`,
            {
                username,
                password
            }
            
        )
        .then(response => {setJwt(response.data.jwt);

            dispatch({
                type: 'login',
                payload: {
                    user: response.data.username,
                    token:response.data.jwt,
                }
            })
        });
    }



    const TestAxios = (event:any) => {
        event.preventDefault();
        axios.get(me as string);
    }

    

    const GroupList:any = groups.map((group:any,index:any) => {
        return(
        <div className="grid-item grid-item-1">
            <div className="Group_List">
                <h2> {group.name}{selectedGroup===group.id?'- SELECTED':''}</h2>
                <button onClick = {() => handleGroupSelection(group.id)}> Select Group </button>
                <button onClick = {(event) => {deleteGroup(event,group.id)}}> Delete Group </button>
                <button onClick= {() => history.push(`/group/${group.id}`)}> Visit Group Page </button>
            </div>
                <div className={selectedGroup === group.id?'members-active':'members'}> {
                        Names.map((member,index) => <li className="members"> {member}</li>)}
                </div>
        </div>
        );
    })

    const createShoppingList = async (event:any) => {
        event.preventDefault();
        if (selectedGroup) await axios.get(`${me}/lists/create/${selectedGroup}`, {
            headers : {
                Authorization : jwt
            },
            params : {
                name : shoppinglistname,
            }
        })
    }

    const SubmitItem = async (event:any) => {
        event.preventDefault();
        if(itemName&&itemDescription&&selectedShoppingList){
            await axios.get(`${me}/items/add/${selectedShoppingList}`, {
                headers : {
                    Authorization : jwt
                },
                params: {
                    name : itemName,
                    description : itemDescription
                }
            })
            return;
        }
        return;
    }
    
    

    return (
        <div>
            <Link to={'/group/231'}> Group 231 </Link>
            <h1> Sign Up </h1>
            <form>
                <label htmlFor="user"> Enter Username: </label>
                <input className="username" id="user" onChange = {handleUsernameChange} />
                <label htmlFor="pass"> Enter Passwrod </label>
                <input className="username" id="pass" onChange = {handlePasswordChange}/>
                <button onClick = {Submit}> Sign Up </button>
                <button onClick = {Submit2}> Sign In </button>
                <button onClick ={TestAxios}> Test Axios</button>
            </form>

            <div>
                <h1> Create Group</h1>
                <form>
                    <label htmlFor= "group"></label>
                    <input className="group name" id="group" onChange={handleGroupnameChange}/>
                    <button onClick={SubmitGroup}> Submit Group: </button>
                </form>
            </div>
            <h1> Groups </h1>
            <div className="grid-container">
                {GroupList}
             </div>

            <div>
                <h1> Create Shopping List </h1>
                <form>
                    <label htmlFor = "list"> Add Shopping List : </label>
                    <input className="class" onChange={(event) => {handleShoppinglistNameChange(event.target.value)}}/>
                    <button onClick={createShoppingList}> Add List : </button>
                </form>
            </div>
            <h1> Shopping Liss : </h1>
            {ShoppingListRows}
            <h1> Add Items : </h1>
            <form> 
                <label htmlFor = "itemname"> Item Name  : </label>
                <input className="item" id="itemname" onChange = {handleItemNameChange}/>
                <label htmlFor = "itemdescription"> Item Description : </label>
                <input id="itemdescription" className ="itemdescription" onChange = {handleItemDescriptionChange}/>
                <button onClick = {SubmitItem}> Submit </button>
            </form>

            <h1> Items For Shopping List : </h1>
            {ItemRows}
        </div>
    );
}

export default Home;