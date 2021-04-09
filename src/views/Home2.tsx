import React from 'react';
import {useState, useEffect, createContext} from 'react';
import axios from 'axios';
import {AuthContext} from '../auth_context';
import {useHistory} from 'react-router-dom';


const GroupEntry:React.FC = () => {
    return <div> </div>
}

const Home:React.FC = () => {

    const [groupname, setGroupName] = useState<string|undefined>();
    const [groups, setGroups] = useState<any>([]);
    const [selectedGroup, setSelectedGroup] = useState<undefined|number>();
    const [inviteuser, setInviteUser] = useState<undefined|string>();
    const [invites, setInvites] = useState<any>();
    
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [login, setLogin] = useState<boolean>(true);
    
    const {state, dispatch} = React.useContext(AuthContext);
    const history = useHistory();

    let api_url = process.env.REACT_APP_API_URL;

    const handleGroupnameChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(event.target.value);
    }

    useEffect(() => {
        const FetchGroups = async () => {
            axios.get(`${api_url}/group/group/mygroups`, {
                headers: {
                    Authorization : state.token
                },
            })
            .then(response => setGroups(response.data))
            .catch(err => console.log(err));
        }
        if(state.token) FetchGroups();
        else return;
    }, [state.token]);

    useEffect(() => {
        const FetchInvites = async () => {
            axios.get(`${api_url}/group/invite/getmyinvites`, {
                headers: {
                    Authorization : state.token
                },
            })
            .then(response => setInvites(response.data))
            .catch(err => console.log(err));
        }
        if(state.token) FetchInvites();
        else return;
    }, [state.token]);

    const SubmitGroup = async (event:any) => {
        event.preventDefault();
        axios.get(`${api_url}/group/create`, {
            params: {
                name : groupname
            },
            headers : {
                Authorization : state.token
            }
        }, 
        )
        .then(response => setGroups([...groups, response.data]))
        .catch(err => console.log(err));
    }

    const Login = async (event:any) => {
        event.preventDefault();
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
        .catch(err => console.log(err));
    }

    const Signup = async (event:any) => {
        event.preventDefault();
        axios.post(`${api_url}/auth/signup`,
            {
                username,
                password
            }           
        )
        .then(response => 
            dispatch({
                type: 'login',
                payload: {
                    user: response.data.user.username,
                    token:response.data.jwt,
                }
            })
        )
        .catch(err => console.log(err));
    }

    const SubmitAuth = (event:any) => {
        if(login){
            Login(event);
        }
        else Signup(event);
    }

    const Logout = (event:any) => {
        event.preventDefault();
        dispatch({
            type:'logout'
        })
    }

    const handleGroupSelection = (id:any) => {
        setSelectedGroup(id);
    }


    const deleteGroup = (event:any, groupid:number) => {
        event.preventDefault();
        axios.get(`${api_url}/group/delete/${groupid}`, {
            headers : {
                Authorization : state.token, 
            }
        })
        .then(response => console.log(response))
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
        return(
        <div >
            <div className="Group_List">
                <h2> {group.name}{selectedGroup===group.id?'- SELECTED':''}</h2>
                <button onClick = {() => handleGroupSelection(group.id)}> Select Group </button>
                {state.user ===group.admin? <button onClick = {(event) => {deleteGroup(event,group.id)}}> Delete Group </button>:null}
                <button onClick= {() => history.push(`/group/${group.id}`)}> Visit Group Page </button>
            </div>
                <div className={selectedGroup === group.id?'members-active':'members'}> {
                        //name.map((member,index) => <li className="members"> {member}</li>)
                    }
                </div>
        </div>
        );
    })

    const InviteList:any = invites?.map((invite:any, index:number) => {
        return(
            <div>
                <h3>{invite.id}</h3>
                <button onClick={(event) => acceptInvite(event, invite.group_id)}> Accept Invite </button>
                <button onClick={(event) => acceptInvite(event, invite.group_id)}> Decline Invite </button>
            </div>
        );
    })

    if(!state.user || !state.token) return (
        <div>
            <h1> {login?'Login Page':'Sign-Up Page'} </h1>
            <button onClick= {(e) => {e.preventDefault(); setLogin(false)}}> New User? Sign Up</button>
            <button onClick= {(e) => {e.preventDefault(); setLogin(true)}}> Returning ? Sign in </button>
            <form>
                <label> Username : </label>
                <input onChange ={(e) => {setUsername(e.target.value)}}/>
                <label> Password: </label>
                <input onChange ={(e) => {setPassword(e.target.value)}}/>
                <button onClick = {SubmitAuth}> {login? 'Login': 'Sign-Up'}</button>
            </form>
        </div>
    );
    else {
        return (
            <React.Fragment>
                <div className="grid-container">
                    <div>
                    <button onClick={Logout}> Logout </button>
                        <h1> Invites : </h1>
                        <div> 
                            {InviteList} 
                        </div>
                    </div>

                    <div>
                        <h1> Your Groups </h1>
                        <div className="nested">
                            {GroupList}
                        </div>
                    </div>

                    <div>
                        <h1> Create Group</h1>
                        <form>
                            <label htmlFor= "group"> New Group : </label>
                            <input className="group name" id="group" onChange={handleGroupnameChange}/>
                            <button onClick={SubmitGroup}> Submit Group: </button>
                        </form>
                    </div>
            </div>
            </React.Fragment>
        );
    }
}


export default Home;
