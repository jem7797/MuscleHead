import React, { Children, createContext, useContext, useState } from 'react'

const UserContext = createContext();


export const UserProvider = ({children}) => {
      const [given_name, setgiven_name] = useState("");
    
      return(
        <UserContext.Provider value ={{given_name, setgiven_name}}>
            {children}
        </UserContext.Provider>
      )
}


export const useUser = () => useContext(UserContext);