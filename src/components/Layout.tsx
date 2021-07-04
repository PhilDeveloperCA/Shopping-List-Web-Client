import React, {useState, useEffect} from 'react';
import {makeStyles} from '@material-ui/core';
import {AuthContext} from '../auth_context';
import Button from '@material-ui/core/Button';
import {useHistory} from 'react-router-dom';
import LoginScreen from './login_screen';
import {Toolbar, AppBar, Typography, Menu, MenuItem, IconButton, Badge, Container} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import axios from 'axios';

const useStyles = makeStyles((theme) => {
    return {
        grow : {
            flexGrow : 1,
        },
        page : {
            background : 'black',
            width: '80%',
        },
        appbar : {
            width : `calc(100%-${0}px)`,
            color : 'white',
        }, 
        toolbar : theme.mixins.toolbar,
        menuButton : {
            marginRight : theme.spacing(2),
        },
        title: {
            display : 'none',
            [theme.breakpoints.up('sm')] : {
                display : 'block'
            },
            flexGrow: 1,
        },
        sectionDesktop : {
            display : 'non',
            [theme.breakpoints.up('md')] : {
                display : 'flex',
            }
        }       
    }
})

const Layout:React.FC = ({children}) => {
    const {state, dispatch} = React.useContext(AuthContext);
    const [displayInvites, Display] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<any>(null);
    const [activePopup, setActivePopup] = useState<boolean>(false);
    const [invites, setInvites] = useState<any>();

 
    const history = useHistory();
    const classes = useStyles();

    const api_url = process.env.REACT_APP_API_URL;

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

    const Logout = (event:any) => {
        event.preventDefault();
        dispatch({
            type:'logout'
        })
        history.push('/');
    }

    const LogoutButton = (
        <Button 
            onClick = {Logout}
            color = "secondary"
            variant = "contained"
            >
            Log Out 
        </Button>
    );

    //{LoginScreen}
    //add Invite Logic to AppBar

    if(!state.token || !state.user){
        return(
            <React.Fragment>
                <LoginScreen />
            </React.Fragment>

        );
    }

    const acceptInvite = (event:any,id:number) => {
        event.preventDefault();
        axios.get(`${api_url}/group/invite/accept/${id}`, {
            headers:{
                Authorization: state.token,
            },
        })
    }

    const handleInvitePopUp = (event:any) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const InviteList:any = invites?.map((invite:any, index:number) => {
        return(
            <div>
                <Container key ={invite.id}>
                    <Typography variant = "h6" align="center" color="primary"> {invite.name}</Typography>
                    <Button onClick={(event) => acceptInvite(event, invite.group_id)} variant = "contained" color = "primary"> Accept Invite </Button>
                    <Button onClick={(event) => acceptInvite(event, invite.group_id)} variant = "contained" color = "secondary"> Decline Invitation : </Button>
                </Container>
            </div>
        );
    })

    const EmptyInviteList:any = (
        <div>
            <Typography >
                You Currently Have no Pending Invitations
            </Typography>
        </div>
    );

    const renderMenu = (
        <Menu
            anchorEl = {anchorEl}
            anchorOrigin = {{vertical: 'top', horizontal :'right'}}
            id = {'primary-search-account-menu'}
            keepMounted
            transformOrigin = {{vertical : 'top', horizontal :'right'}}
            open = {!(anchorEl === null)}
            onClose = {handleClose}
        >
            <MenuItem> Profile </MenuItem>
            <MenuItem> My Account </MenuItem>
            <MenuItem> 
                <Container> 
                    {state.token?invites?InviteList:EmptyInviteList:null}
                </Container>
            </MenuItem>
        </Menu>
    );


    //{!state.user || !state.token?null:LogoutButton}
    
    return(
        <div className={classes.grow}>
            <AppBar className={classes.grow} position="static">
                <Toolbar>
                    <IconButton edge = "start" color="inherit" aria-label="open drawer" className={classes.menuButton}> 
                    <MenuIcon />
                    </IconButton>
                    <Typography className={classes.title} variant="h6" noWrap>
                        Welcome {state.user}
                    </Typography>
                    <div className={classes.sectionDesktop}> 
                        <IconButton aria-label="show 17 new notifications" className={classes.menuButton} aria-haspopup="true" onClick={handleInvitePopUp}>
                            <Badge badgeContent={17} color = "secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <IconButton aria-label="Show Invites" className={classes.menuButton} onClick={handleInvitePopUp}>
                            <Badge badgeContent={invites?invites.length:0} color = "secondary">
                                <MailIcon />
                            </Badge>
                        </IconButton>
                    </div>
                    {LogoutButton}
                </Toolbar>
                {renderMenu}
            </AppBar>
            <div className={classes.toolbar}></div>
            {children}
        </div>
    );
}

export default Layout;