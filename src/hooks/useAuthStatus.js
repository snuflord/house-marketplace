
// THIS CUSTOM HOOK HANDLES CHECKING USER LOGGED IN

import {useEffect, useState} from 'react'
// get auth/ on auth state changed - whenever goes from logged in to !logged in, this function triggers
import {getAuth, onAuthStateChanged} from 'firebase/auth'

export const useAuthStatus = () => {

    const [loggedIn, setLoggedIn] = useState(false)
    const [loading, setIsLoading] = useState(true)

    useEffect(() => {
        // getting authentication/exporting in 'auth'
     const auth = getAuth()
     // passing auth as parameter in function, which returns a user
     onAuthStateChanged(auth, (user) => {
        // if there is a user, set logged in to true
        if(user) {
            setLoggedIn(true)
            setTimeout(() => {
              setLoggedIn(false)
            }, 3000000)
        } 
            setIsLoading(false)
     })
    });

  return (
    {loggedIn, loading }
  )
}
