import React from 'react';
import {useState, useEffect} from 'react';
import axios, { AxiosResponse } from 'axios';
import {useHistory, useLocation, useParams, useRouteMatch} from 'react-router-dom';
import { AuthContext } from '../../auth_context';
import {Button} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import {Grid, Container, IconButton, Typography, makeStyles, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, TablePagination, TableSortLabel, Toolbar, Checkbox, TextField} from '@material-ui/core';


interface FormProps {
    handleSubmit : Function,
    ErrorState : formError,
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

const ItemForm : React.FC<FormProps> = ({handleSubmit, ErrorState}) => {
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

export default ItemForm;