import React from 'react';
import {useState, useEffect} from 'react';
import axios, { AxiosResponse } from 'axios';
import {useHistory, useLocation, useParams, useRouteMatch} from 'react-router-dom';
import { AuthContext } from '../auth_context';
import {Button} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import {Grid, Typography, makeStyles, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, TablePagination, TableSortLabel, Toolbar, Checkbox, TextField} from '@material-ui/core';

//Organized List Shopping By Person
type ShoppingListInterface = {
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

const useStyle = makeStyles({
    heading : {
        marginTop : 20,
        marginBottom : 20,
        align : 'center'
    }
})

const ShoppingList:React.FC<ShoppingListInterface> = ({jwt}) => {
    const [itemName,setItemName] = useState<undefined|string>();
    const [nameError, setNameError] = useState<string|null>(null);
    const [itemDescription, setItemDescription] = useState<undefined|string>();
    const [descriptionError, setDescriptionError] = useState<string|null>(null);
    const [itemTax, setItemTax] = useState<boolean[]>([]);
    const [tax, setTax] = useState<number>(0);
    const [items, setItems] = useState<Item[]>([]);
    const [costs, setCosts] = useState<any>();
    const [users, setUsers] = useState<string[]>([]);
    const [quantity, setQuantity] = useState<any>();
    const [costTable, setCostTable] = useState<any>(null);
    const [activeItems, setActiveItems] = useState<boolean[]>([]);

    const classes = useStyle();
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
        if(itemName === null || itemName ==='' || itemName === undefined) return setNameError('Enter a Valid Name ')
        if(itemDescription === null || itemDescription || '' || itemDescription === undefined) return setItemDescription('Enter a Valid Description')
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

    const headCells = [
        {id : 'creator', numeric: false, disablePadding:false, label:'Creator'},
        {id : 'name', numeric : false, disablePadding : false, label : 'Product Name'}
    ]

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

    //const costsTableJSX = costTable?.map((element:any,index:number) => {
        //return <li> {element.user} : {element.price} </li>
    const costsTableJSX = () => {
        if(!costTable) return null;
        return (
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell> User : </TableCell>
                            <TableCell align="left"> Cost : </TableCell>
                        </TableRow>
                    </TableHead>
                        <TableBody>
                            {costTable.map((element:any, index: number) => {
                                return (<TableRow key={element.user} component="th" scope="row">
                                    <TableCell> {element.user} </TableCell>
                                    <TableCell align="right"> {element.price || 0.00} </TableCell>
                                </TableRow>);
                            })}
                        </TableBody>
                </Table>
            </TableContainer>
        );
    }
    

    return(
        <React.Fragment>
        <Grid container>
            <Grid item xl ={12} xs={12}>
                <Button
                onClick = {(e) => {e.preventDefault(); history.push(`/group/${id}`)}}
                startIcon = {<ArrowBackIcon />}
                >
                    Back to Group 
                </Button>
            </Grid>
            <Grid item xs={4} lg = {4}>
                <form noValidate autoComplete="off">
                        <TextField 
                        label = "Tax Rate (%)"
                        onChange={e => setTax(parseFloat(e.target.value))}
                        required
                        color = "primary"
                        variant = "outlined"
                        />
                    </form>
                    <Button
                        onClick={generateCostsTable}
                        variant ="outlined"
                        color = "secondary">
                            Compute Price Table : 
                    </Button>
            </Grid>
            <Grid item xs={2} xl = {2}></Grid>
            <Grid item xs = {4} xl = {4}>
                {costTable?costsTableJSX():null}
            </Grid>
            <Grid item xs={2} xl = {2}></Grid>
            <Grid item xs={12} lg={8}>
                <Typography
                    variant = "h5"
                >
                    Add Items : 
                </Typography>
                <form noValidate autoComplete="off">
                    <TextField 
                    label = "Item Name "
                    onBlur= {(e)=> setItemName(e.target.value)}
                    variant = "outlined"
                    color = "primary"
                    required
                    error = {nameError === null?false:true}
                    helperText = {nameError}
                    />
                    <TextField                     
                    label = "Item Description"
                    onBlur= {(e)=> setItemDescription(e.target.value)}
                    variant = "outlined"
                    color = "primary"
                    required
                    error = {descriptionError === null?false:true}
                    helperText = {descriptionError}
                    />
                </form>
                <Button
                    onClick = {SubmitItem}
                    variant = "outlined"
                    color = "secondary"
                    >
                        Submit 
                    </Button>
                <Typography
                className = {classes.heading}
                align = 'center'
                variant = "h3"
                color = "secondary">
                    Shopping List 
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="right"> Creator : </TableCell>
                                <TableCell align="right"> Item Name :  </TableCell>
                                <TableCell align="right"> Quantity </TableCell>
                                <TableCell align="right"> Price/Unit : </TableCell>
                                <TableCell align="right"> Apply Tax ? :</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items?.map((item,index) => {
                                return (
                                <TableRow key={item.id}>
                                    <TableCell component = "th" scope = "row"> {item.username} </TableCell>
                                    <TableCell align="right"> {item.name} </TableCell>
                                    <TableCell align="right"> <input step="1" size={4} onBlur={(event) => handleChangeQuantity(event,index)}/> </TableCell>
                                    <TableCell align="right"> <input step=".01" size={6} onBlur={(event) => handleChangeCost(event,index)}/>  </TableCell>
                                    <TableCell align="right"> <input type="checkbox"  onClick= {(e)=> handleTaxQuantity(index)}/> </TableCell>
                                </TableRow> );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}



export default ShoppingList;