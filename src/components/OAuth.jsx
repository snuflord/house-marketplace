import {useLocation, useNavigate} from 'react-router-dom'
import {getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider} from 'firebase/auth'
import {doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import googleIcon from '../assets/svg/googleIcon.svg'
import facebookIcon from '../assets/jpg/facebookIcon.png'

function OAuth() {

    const navigate = useNavigate()
    const location = useLocation()

    // on clicking the google icon, a new window will be created, allowing the user to choose a google account
    const onGoogleClick = async () => {
        try {
            const auth = getAuth()
            const provider = new GoogleAuthProvider()
            // allow account selection
            provider.setCustomParameters({
                prompt: 'select_account',
              });
            // pop up will create a new window instead of redirecting
            const result = await signInWithPopup(auth, provider)
            const user = result.user;
            // check for existing user
            const docRef = doc(db, 'users', user.uid)
            const docSnap = await getDoc(docRef)
            // if user doesn;t exist, create user
            if(!docSnap.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    name: user.displayName,
                    email: user.email,
                    timestamp: serverTimestamp(),
                })
            } 
            navigate('/')
        } catch (error) {
            toast.error('Could not authorise with Google')
        }
    }

    const onFBClick = async () => {
        try {
            const auth = getAuth()
            const provider = new FacebookAuthProvider()
            
            // pop up will create a new window instead of redirecting
            const result = await signInWithPopup(auth, provider)
            const user = result.user;
            // check for existing user
            const docRef = doc(db, 'users', user.uid)
            const docSnap = await getDoc(docRef)
            // if user doesn;t exist, create user
            if(!docSnap.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    name: user.displayName,
                    email: user.email,
                    timestamp: serverTimestamp(),
                })
            } 
            navigate('/')
        } catch (error) {
            console.log(error)
            toast.error('Could not authorise with Facebook')
        }
    }

  return (
    <>
        <div className="socialLogin">
            <p>Sign {location.pathname ==='/sign-up' ? 'up' : 'in'} with</p>
            <button className="socialIconDiv" onClick={onGoogleClick}>
                <img className='socialIconImg' src={googleIcon} alt="google" />
            </button>
            <p>Sign {location.pathname ==='/sign-up' ? 'up' : 'in'} with</p>
            <button className="socialIconDiv" onClick={onFBClick}>
                <img className='socialIconImg' src={facebookIcon} alt="fb" />
            </button>
        </div>
    </>
    
    
  )
}

export default OAuth