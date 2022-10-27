import {getAuth, updateProfile} from 'firebase/auth'
import {updateDoc, doc, collection, getDocs, query, where, orderBy, deleteDoc} from 'firebase/firestore'
import {db} from '../firebase.config'
import {useEffect, useState} from'react'
import { Link, useNavigate } from 'react-router-dom'
import {toast} from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'


function Profile() {

  const navigate = useNavigate()
  const auth = getAuth()

  // setting state for change details to default false
  const [changeDetails, setChangeDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)

  const {name, email} = formData

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings')
      const q = query(listingsRef, where('useRef', '==', auth.currentUser.uid), orderBy('timestamp', 'desc',))
      const querySnap = await getDocs(q)

      const listings = []
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data()
        })
    })
      setListings(listings)
      setLoading(false)
    }
    fetchUserListings()
  }, [auth.currentUser.uid])

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

  const onDelete = async (listingId) => {
    
    if(window.confirm('Are you sure you want to delete?')) {
      // function parameter listingId corresponds with onDelete(listing.id) in listing item below (unique id of listing)
      await deleteDoc(doc(db, 'listings', listingId))
      // below = updating listings by filtering out listings with id's that are no longer there.
      const updatedListings = listings.filter((listing) => listing.id !== listingId)
      // updating listings in state.
      setListings(updatedListings)
      toast.success('Listing deleted')
    }
  }

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)

  
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

            {loading ? <Spinner/> : listings && listings.length > 0 ? <>
            <main>
              <p className="listingText">Your Listings</p>
                <ul className='listingList'>
                    {listings.map((listing) => (
                        <ListingItem key={listing.id} id={listing.id} listing={listing.data} onDelete={() => onDelete(listing.id)} onEdit={() => onEdit(listing.id)} />
                    ))}
                </ul>
            </main>
        </> : <p>No current listings</p>}
          </main>
        </div>
      </>
    )
  }
  
  export default Profile