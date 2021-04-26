import React, {createContext, useReducer} from 'react';

type AuthType = {
    user : string|null;
    token:string|null;
}

export const initialState = {
    user : JSON.parse(localStorage.getItem('user') as string),
    //user: 'William',
    token: JSON.parse(localStorage.getItem('token') as string)
}

export const authreducer = (state:any,action:any) => {
    switch(action.type){
        case "login":
            localStorage.setItem('user', JSON.stringify(action.payload.user))
            localStorage.setItem("token", JSON.stringify(action.payload.token))
            return {
                ...state,
                user: action.payload.user,
                token : action.payload.token,
            }
        case 'logout':
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return {
                ...state,
                user:null,
                token:null
            }
        default:
            
    }
}

export const AuthContext = createContext<{state: AuthType, dispatch:React.Dispatch<any>}>({state:initialState, dispatch: () => null});

export const AuthProvider: React.FC = ({children}) => {
    const [state,dispatch] = useReducer(authreducer, initialState);
    const value = {state, dispatch}
    return(
        <AuthContext.Provider value={value as any}>
            {children}
        </AuthContext.Provider>
    )
}

export {}