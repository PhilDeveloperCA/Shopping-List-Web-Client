import axios from 'axios';

/*const handleAuthFailure = {
    success: (response:any) => dispatch({
        type: 'login',
        payload: {
            user: response.username,
            token:response.jwt,
        }
    }),
    failure : (respone:any) => dispatch({
        type:'logout'
    })
}*/

export async function tryNetWorkFetch(any:() => Promise<any>, dispatch:(object:any) => any) {
    any()
    .then(res => {
        return res.data;
    })
    .catch(err => {
        retryRefresh()
        .then(response => dispatch({
                type: 'login',
                payload: {
                    user: response.username,
                    token:response.jwt,
                }
            })
        )
        .catch(err => {
            dispatch({
                type: 'logout'
            })
        })
    })
}

export default async function retryRefresh():Promise<{jwt:string, username:string}>{

    const response = await axios.post('/api/auth/refresh');
    const {jwt, username }= response.data;

    return new Promise((resolve, reject) => {
        if(!jwt){
            reject("Must Reauthenticate");
        }
        else{
            resolve({jwt,username});
        }
    })
}