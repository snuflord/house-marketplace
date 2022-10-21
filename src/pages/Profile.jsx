import {getAuth, updateProfile} from 'firebase/auth'
import {updateDoc, doc} from 'firebase/firestore'
import {db} from '../firebase.config'
import {useEffect, useState} from'react'
import { Link, useNavigate } from 'react-router-dom'
import {toast} from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'


function Profile() {

  const navigate = useNavigate()
  const auth = getAuth()

  // setting state for change details to default false
  const [changeDetails, setChangeDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const {name, email} = formData

  const onLogout = () => {
    // signs out current user and returns to sign in page
    auth.signOut();
    navigate('/sign-in');
  }

  // on click toggles setChangeDetails, submit commits update to firebase.
  const onSubmit = async (e) => {

    try {
      // if current user name is not equal to the new name value passed in on input
      if(auth.currentUser.displayName !== name) {
        // update the display name with new input value - updateProfile takes in auth.current user, and returns an object with the values we want replaced (name from input)
        await updateProfile(auth.currentUser, {
          displayName: name,
        })
        // update in firestore - create reference to firestore document, takes in db from firebase.config
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name,
        })
      }
      
    } catch (error) {
      toast.error('Could not update details')
    }
  }
  

  const onChange = (e) => {
    // get previous state and return an object
    setFormData((prevstate) => ({
      // spread operator across previous state
      ...prevstate,
      // targeting id of either name or email, then replacing previous formData state with new input.
      [e.target.id]: e.target.value,
    }))
  }
  
    return (
      <>
        <div className="pageContainer">
          <header className="profileHeader">
            <p className="pageHeader">My Profile</p>
            <button className="logOut" type='button' onClick={onLogout}>Log out</button>
          </header>
          <main>
            <div className="profileDetailsHeader">
              <p className="profileDetailsText">Personal Details</p>
              {/* clicking the 'change' text will create an instance of changeDetails (now set to true), allowing the onChange function in inputs below to be run. */}
              <p className="changePersonalDetails" onClick={() => {
                changeDetails && onSubmit();
                {/* When we submit, the changeDetails (that was set to true on click, will be set back to false) */}
                 setChangeDetails((prevState) => !prevState)}}>
                  {changeDetails ? 'done' : 'change'}
              </p>
            </div>
            <div className="profileCard">
              <form>
                {/* Inputs are disabled when they do not have a classname of changeDetails. Changedetails is handled by onclick setting changeDetails state to be updated */}
                <input type="text" id='name' className={!changeDetails ? 'profileName' : 'profileNameActive'}
                disabled={!changeDetails} value={name} onChange={onChange}/>
                <input type="text" id='email' className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
                disabled={!changeDetails} value={email} onChange={onChange}/>
              </form>
            </div>
            <Link to='/create-listing' className='createListing'>
              <img src={homeIcon} alt="home" />
              <p>Sell or rent your property</p>
              <img src={arrowRight} alt="create-listing" />
            </Link> 
          </main>
        </div>
      </>
    )
  }
  
  export default Profile