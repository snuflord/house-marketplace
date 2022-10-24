import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Explore from './pages/Explore';
import Offers from './pages/Offers';
import Category from './pages/Category';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import CreateListing from './pages/CreateListing';
import Listing from './pages/Listing';
import ForgotPassword from './pages/ForgotPassword';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


function App() {


  return (

    <>
    <Router>
      <Routes>
        <Route path='/' element={<Explore/>}/>
        <Route path='/offers' element={<Offers/>}/>
        <Route path='/category/:categoryName' element={<Category/>}/>
        <Route path='/profile' element={<PrivateRoute/>}>
          {/* This route below is the 'Outlet in PrivateRoute */}
          <Route path='/profile' element={<Profile/>}/>
          å
        </Route>
        <Route path='/sign-in' element={<SignIn/>}/>
        <Route path='/sign-up' element={<SignUp/>}/>
        <Route path='/create-listing' element={<CreateListing/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='category/:categoryName/:listingId' element={<Listing/>} />
        <Route path='/contact/:landlordId' element={<Contact/>} />
      </Routes>
        <Navbar />

    </Router>
    
    <ToastContainer />

    {/* Navbar */}
    </>
  );
}

export default App;
