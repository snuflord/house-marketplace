// Navigate component used to redirect and outlet - allows rendering of child elements
import {Navigate, Outlet} from 'react-router-dom' 
import { useAuthStatus } from '../hooks/useAuthStatus'
import Spinner from './Spinner'

const PrivateRoute = () => {

    // destructuring useAuthStatus 
    const {loggedIn, loading} = useAuthStatus()

    if(loading) {
        return <Spinner />
    }

  return (
    // if logged in, go to the Outlet component (/profile) defined in app.js, otherwise go to /sign-in
    loggedIn ? <Outlet /> : <Navigate to='/sign-in'/>
  )
}

export default PrivateRoute