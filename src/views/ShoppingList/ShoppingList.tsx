import React from 'react';
import {useState, useEffect} from 'react';
import axios, { AxiosResponse } from 'axios';
import {useHistory, useLocation, useParams, useRouteMatch} from 'react-router-dom';
import { AuthContext } from '../../auth_context';
import {Button} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import {Grid, Container, IconButton, Typography, makeStyles, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, TablePagination, TableSortLabel, Toolbar, Checkbox, TextField} from '@material-ui/core';
import ItemForm from './ItemForm';


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

//display item vs submit item 
type Item2 = {
    id : number,
    username : string,
    name : string,
    description: string,
    costs : number, 
    appliedTax : boolean
}

type formError = {
    descriptionError : string|null;
    nameError : string|null;
    categoryError: string|null;
}

interface FormItem {
    name : string|null,
    description : string|null,
    category1 : string|null,
    category2: string|null,
}

const ShoppingList:React.FC<ShoppingListInterface> = ({jwt}) => {
    const [itemName,setItemName] = useState<undefined|string>();
    const [nameError, setNameError] = useState<string|null>(null);
    const [error, setError] = useState<formError>({descriptionError:null, nameError:null, categoryError:null})
    const [itemDescription, setItemDescription] = useState<undefined|string>();
    const [descriptionError, setDescriptionError] = useState<string|null>(null);
    const [itemTax, setItemTax] = useState<boolean[]>([]);
    const [tax, setTax] = useState<number>(0);
    const [items, setItems] = useState<Item[]>([]);
    const [itemList, setItemList] = useState<Item2[]>([]);
    const [costs, setCosts] = useState<any>();
    const [users, setUsers] = useState<string[]>([]);
    const [quantity, setQuantity] = useState<any>();
    const [costTable, setCostTable] = useState<any>(null);
    const [activeItems, setActiveItems] = useState<boolean[]>([]);
    const [category1, setCategory1] = useState<string|null>(null);
    const [category2, setCategory2] = useState<string|null>(null);
    const [categoryError, setCategoryError] = useState<string|null>(null);

    const classes = useStyle();
    let me = process.env.REACT_APP_API_URL;

    let history = useHistory();
    let match = useRouteMatch();
    let location = useLocation();
    const {listid} = useParams<{listid:string|undefined}>();
    const {id} = useParams<{id:string|undefined}>();

    const {state, dispatch} = React.useContext(AuthContext);

    const instance = axios.create({
        baseURL : process.env.REACT_APP_API_URL,
        timeout : 1000,
        headers : {
            'Authorization' : state.token,
        }
    })

    function onlyUnique(value:any, index:any, self:any) {
        return self.indexOf(value) === index;
      }

    useEffect(()=> {
        const fetchItems = async () => {
            try {
                const response : AxiosResponse = await instance.get(`/app/group/${id}/list/${listid}/item`);
                setItems(response.data);
                const users:string[]= response.data.map((item:Item) => item.username);
                setUsers(users.filter(onlyUnique));
                setCosts(response.data.map((response:any,index:any) => 0));
                setQuantity(response.data.map((response:any,index:any) => 1));
                setItemTax(response.data.map((response:any,index:any) => false));
                setItemList(response.data.map((response:any) => {
                    return {...response, appliedTax : false, price:0.00, quanity:0}
                }))
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

    const deleteItem = async (itemid :number, index:number) => {
        instance.delete(`/app/group/${id}/list/${listid}/item/${itemid}`)
            .then(response => setItems([...items.slice(0,index), ...items.slice(index+1)]))
            .catch(err => console.log(err));
    }

    const deleteItem2 = async (id :number, index:number) => {
        axios.get(`${me}/list/${listid}/delete/${id}`, {
            headers: {
                Authorization: state.token,
            },
            params : {
                id
            }
        })
        .then(response => setItems([...items.slice(0,index), ...items.slice(index+1)]))
        .catch(err => console.log(err));
    }



    const SubmitItem = async (event:any) => {
        event.preventDefault();
        console.log(category1);
        console.log(category2);
        if(category1!=null && category1 === category2) return setError({...error, ['categoryError']:'Enter Different or Only 1 Category' })
        if(category1!=null && category1 === category2) return setCategoryError('Enter Different or Only 1 Category');
        if(category1!=null && category1 === category2) return setError({...error, ['nameError']:'Enter a Valid Name' })
        if(itemName === null || itemName ==='' || itemName === undefined) return setNameError('Enter a Valid Name ')
        if(category1!=null && category1 === category2) return setError({...error, ['categoryError']:'Enter a Valid Description' })
        if(itemDescription === null || itemDescription === '' || itemDescription === undefined) return setDescriptionError('Enter a Valid Description')
        if(itemName&&itemDescription){
            try{
                const response = await instance.post(`/app/group/${id}/list/${listid}/item`, {
                    name : itemName,
                    description : itemDescription,
                    category1 : category1,
                    category2 : category2,           
                })
                const item:Item= response.data[0];
                setItems([...items,item])
                setItemTax([...itemTax, false]);
                setCosts([...costs, 0]);
                setQuantity([...quantity, 1]);
                setItemName(''); setItemDescription(''); setNameError(null); setDescriptionError(null); setCategory1(''); setCategory2(''); setCategoryError(null);
            }
            catch(err){
                console.log(err);
            }   
            return;
        }
        return;
    }

    const SubmitItem2 = async (event:any, item:FormItem) => {
        event.preventDefault();
        console.log(item);
        if(item.category1!=null && item.category1 === item.category2) return setError({...error, ['categoryError']:'Enter Different or Only 1 Category' })
        if(item.name === null || item.name === '') return setError({...error, ['nameError']:'Enter a Valid Name' })
        if(item.description === null || item.description === '') return setError({...error, ['descriptionError']:'Enter a Valid Description' })

        if(true){
            try{
                const response = await instance.post(`/app/group/${id}/list/${listid}/item`, {...item})
                const newitem:Item= response.data[0];
                newitem['username'] = !state.user? '' : state.user
                setItems([...items,newitem])
                setItemTax([...itemTax, false]);
                setCosts([...costs, 0]);
                setQuantity([...quantity, 1]);
                setItemName(''); setItemDescription(''); setNameError(null); setDescriptionError(null); setCategory1(''); setCategory2(''); setCategoryError(null);
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
            <Grid item xl={12} xs ={12}>
                <ItemForm handleSubmit={SubmitItem2} ErrorState={error}/>
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
                <Container>
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
                    multiline
                    fullWidth
                    rows = {4}
                    required
                    error = {descriptionError === null?false:true}
                    helperText = {descriptionError}
                    />
                </form>
                <form autoComplete="off" noValidate>
                <TextField                     
                    label = "1st Category"
                    onBlur= {(e) => {
                        if(e.target.value != undefined){
                            setCategory1(e.target.value);
                        }
                    }}
                    variant = "outlined"
                    color = "secondary"
                    />
                    <TextField                     
                    label = "2nd Category "
                    onBlur= {(e) => {
                        if(e.target.value != undefined){
                            setCategory2(e.target.value);
                        }
                    }}
                    variant = "outlined"
                    color = "secondary"
                    error = {categoryError === null?false:true}
                    helperText = {categoryError}
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
                                <TableCell align="right"> </TableCell>
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
                                    <TableCell align="right"> <IconButton color="primary" onClick={(e:any) => {e.preventDefault(); deleteItem(item.id, index)}}/></TableCell>
                                </TableRow> );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                </Container>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

interface FormProps {
    handleSubmit : Function,
    ErrorState : formError,
}

/*const ItemForm : React.FC<FormProps> = ({handleSubmit, ErrorState}) => {
    const [item, setItem] = useState<FormItem>({name:null, description:null, category1:null, category2:null});

    const handleChange = (e:any, name:string) => {
        setItem({...item, [name]:e.target.value});
    } 

    return(
        <React.Fragment>
        <Container>
                <Typography
                    variant = "h5"
                >
                    Add Items : 
                </Typography>
                <form noValidate autoComplete="off">
                    <TextField 
                    label = "Item Name "
                    onBlur= {(e)=> handleChange(e, 'name')}
                    variant = "outlined"
                    color = "primary"
                    required
                    error = {ErrorState.nameError === null?false:true}
                    helperText = {ErrorState.nameError}
                    />
                    <TextField                     
                    label = "Item Description"
                    onBlur= {(e)=> handleChange(e, 'description')}
                    variant = "outlined"
                    color = "primary"
                    multiline
                    fullWidth
                    rows = {4}
                    required
                    error = {ErrorState.descriptionError === null?false:true}
                    helperText = {ErrorState.descriptionError}
                    />
                </form>
                <form autoComplete="off" noValidate>
                <TextField                     
                    label = "1st Category"
                    onBlur= {(e) => {
                        if(e.target.value != undefined){
                            handleChange(e, 'category1');
                        }
                    }}
                    variant = "outlined"
                    color = "secondary"
                    />
                <TextField                     
                    label = "2nd Category "
                    onBlur= {(e) => {
                        if(e.target.value != undefined){
                            handleChange(e, 'category2');
                        }
                    }}
                    variant = "outlined"
                    color = "secondary"
                    error = {ErrorState.categoryError === null?false:true}
                    helperText = {ErrorState.categoryError}
                />
                </form>
                <Button
                    variant = "outlined"
                    color = "secondary"
                    onClick = {(e) => {handleSubmit(e, item)}}
                >
                    Add Item : 
                </Button>
        </Container>
        </React.Fragment>
    );
}

/*
                <Button
                    onClick = {handleSubmit}
                    variant = "outlined"
                    color = "secondary"
                >
                        Submit 
                </Button>
*/



export default ShoppingList;