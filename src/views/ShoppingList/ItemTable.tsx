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

interface Item {
    id : number,

}

interface TableProps {
    items : Item[],

}

/*
const ItemTable:React:FC<TableProps> = ({items}) => {
        
}
*/
export {}



