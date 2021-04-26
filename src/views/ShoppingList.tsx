import React from 'react';
import {useState, useEffect} from 'react';
import axios, { AxiosResponse } from 'axios';
import {useHistory, useLocation, useParams, useRouteMatch} from 'react-router-dom';
import { AuthContext } from '../auth_context';
import {Button} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

//Organized List Shopping By Person
interface ShoppingListInterface {
    //id : number
    jwt : string,
}

type Item  = {
    id : number,
    username : string,
    name : string,
    description: string
}

type Cost = {
    quantity : number,
    cost: number,
    tax: boolean|number,
}

type Totals = {
    cost : number,
    name : string,
}

const ShoppingList:React.FC<ShoppingListInterface> = ({jwt}) => {
    const [itemName,setItemName] = useState<undefined|string>();
    const [itemDescription, setItemDescription] = useState<undefined|string>();
    const [itemTax, setItemTax] = useState<boolean[]>([]);
    const [tax, setTax] = useState<number>(0);
    const [items, setItems] = useState<Item[]>([]);
    const [costs, setCosts] = useState<any>();
    const [users, setUsers] = useState<string[]>([]);
    const [quantity, setQuantity] = useState<any>();
    const [costTable, setCostTable] = useState<any>(null);
    const [activeItems, setActiveItems] = useState<boolean[]>([]);

    let me = process.env.REACT_APP_API_URL;

    let history = useHistory();
    let match = useRouteMatch();
    let location = useLocation();
    const {listid} = useParams<{listid:string|undefined}>();
    const {id} = useParams<{id:string|undefined}>();

    const {state, dispatch} = React.useContext(AuthContext);

    function onlyUnique(value:any, index:any, self:any) {
        return self.indexOf(value) === index;
      }

    useEffect(()=> {
        const fetchItems = async () => {
            try {
                const response : AxiosResponse = await axios.get(`${me}/items/get/${listid}`, {
                    headers : {
                        Authorization : state.token, 
                    }
                });
                setItems(response.data);
                const users:string[]= response.data.map((item:Item) => item.username);
                setUsers(users.filter(onlyUnique));
                setCosts(response.data.map((response:any,index:any) => 0));
                setQuantity(response.data.map((response:any,index:any) => 1));
                setItemTax(response.data.map((response:any,index:any) => false));
            }
        catch(err){
            console.log(err);
            history.push('/');
            }
        }
        fetchItems();
    }, []);

    const handleChangeQuantity = (event:any, index:number) => {
        if(event.target.value != undefined && !isNaN(event.target.value)){
            setQuantity([...quantity.slice(0,index),parseInt(event.target.value),...quantity.slice(index+1)])
        }
    }

    const handleChangeCost = (event:any, index:number) => {
        if(event.target.value != undefined && !isNaN(event.target.value)){
            setCosts([...costs.slice(0,index),parseFloat(event.target.value),...costs.slice(index+1)])
        }
    }
    const handleTaxQuantity = (index:number) => {
            const currentValue= itemTax[index];
            setItemTax([...itemTax.slice(0,index),!currentValue,...itemTax.slice(index+1)])
    }

    const createItem = async (name:string, description:string) => {
        try{
            const response:any = await axios.get(`${me}/items/add/${listid}`, {
                headers: {
                    Authorization : state.token,
                },
                params : {
                    name,
                    description
                }
            });
            const item:Item= response.data[0];
            setItems([...items,item])
            console.log(items);
        }
        catch(err){
            console.log(err);
        }
        //do something with Redux or local state here???
    }

    const deleteItem = async (id :number) => {
        const item = await axios.get(`${me}/lists/deleteItem/${listid}`, {
            headers: {
                Authorization: jwt,
            },
            params : {
                id
            }
        })
    }

    const ItemDisplay = items?.map((item, index) => {
        return (
            <tr> 
                <td> {item.username} </td>
                <td> {item.name} </td>
                <td> Quantity:  <input step="1" size={4} onBlur={(event) => handleChangeQuantity(event,index)}/></td>
                <td> Cost : <input step=".01" size={6} onBlur={(event) => handleChangeCost(event,index)}/> </td>
                <td><input type="checkbox"  onClick= {(e)=> handleTaxQuantity(index)}/></td>
            </tr>
        );
    });

    const SubmitItem = async (event:any) => {
        event.preventDefault();
        if(itemName&&itemDescription){
            try{
                const response = await axios.get(`${me}/items/add/${listid}`, {
                    headers : {
                        Authorization : state.token
                    },
                    params: {
                        name : itemName,
                        description : itemDescription
                    }
                })
                const item:Item= response.data[0];
                setItems([...items,item])
                setItemTax([...itemTax, false]);
                setCosts([...costs, 0]);
                setQuantity([...quantity, 1]);
            }
            catch(err){
                console.log(err);
            }   
            return;
        }
        return;
    }

    const CalculateCosts = (name:string) => {
        var total_price = 0.00;
        for(var i=0; i<items.length;i++){
            if(name===items[i].username) total_price+= costs[i]*quantity[i]*(itemTax[i]?(1+tax/100):1);
        }
        return total_price.toFixed(2);
    }

    const generateCostsTable = (event:any) => {
        var new_costs = users.map((user,index) => {
            return {
                 user : user,
                 price : CalculateCosts(user)
            }
        })
        setCostTable(new_costs);
    }

    const costsTableJSX = costTable?.map((element:any,index:number) => {
        return <li> {element.user} : {element.price} </li>
    })
    

    return(
        <React.Fragment>
              <Button
                    onClick = {(e) => {e.preventDefault(); history.push(`/group/${id}`)}}
                    startIcon = {<ArrowBackIcon />}
                    >
                        Back to Group 
                    </Button>
            <div className="grid-container">
                <div> 
                    <button onClick={(e)=> {
                        e.preventDefault();
                        history.push(location.pathname+'/compose');
                    }}> Test Compute Price List  </button>            
                    <label> Tax Rate : </label>
                    <input onChange={e => setTax(parseFloat(e.target.value))}/>
                </div>
                <div>
                    <h1> Add Items : </h1>
                    <form> 
                        <label htmlFor = "itemname"> Item Name  : </label>
                        <input className="item" id="itemname" onBlur= {(e)=> setItemName(e.target.value)}/>
                        <label htmlFor = "itemdescription"> Item Description : </label>
                        <input id="itemdescription" className ="itemdescription" onBlur = {(e => setItemDescription(e.target.value))}/>
                        <button onClick = {SubmitItem}> Submit </button>
                    </form>
                </div>
                <h1> Shopping List </h1>
                <div>
                    <div>
                        <form></form>
                    </div>
                    <button onClick={generateCostsTable}> Calculate Costs </button>
                    {costTable?costsTableJSX:null}
                </div>
            </div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th> Creator </th>
                            <th> Name </th>
                            <th> Quantity </th>
                            <th> Price/Unit </th>
                            <th> Apply Tax </th>
                        </tr>
                    </thead>
                    {ItemDisplay}
                </table>
            </div>
        </React.Fragment>
    );
}

//Form Where you Can Add Items (sidebar)



export default ShoppingList;