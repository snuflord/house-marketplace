import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import {getAuth, createUserWithEmailAndPassword, updatePassword, updateProfile} from 'firebase/auth'
import {setDoc, doc, serverTimestamp} from 'firebase/firestore'
import { db } from '../firebase.config'
import OAuth from '../components/OAuth'


function SignUp() {
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  // Destructuring objects from formData
  const {name, email, password} = formData

  const navigate = useNavigate()

  const onChange = (e) => {
    setFormData((prevstate) => ({
      // spread operator across previous state
      ...prevstate,
      // targeting id of either email or password, then replacing previous formData state with new input.
      [e.target.id]: e.target.value,
    }))
  }

  // creating a new user on Submit of info in form.
  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      // getting auth object from getAuth - conta
      const auth = getAuth()
      // registering user with function to handle user creation, returns promise, exported as userCredential.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // A new user is returned, passed into 'user' object
      const user = userCredential.user
      // updating the display name - take current user, and replace with displayname (value given by user)
      updateProfile(auth.currentUser, {
        displayName: name
      })

      // getting form data and making a copy - contains user name, email, password 
      const formDataCopy = {...formData}
      // deleting password from formdata object
      delete formDataCopy.password
      // adding timestamp to data once it is added
      formDataCopy.timestamp = serverTimestamp()

      // adding data to database - get firestore (db)- the table 'users', then the data - the new user object uid and the formdatacopy (the email and name)
      await setDoc(doc(db, 'users', user.uid), formDataCopy)
      
      navigate('/')
      
    } catch (error) {
      console.log(error)
    }
  }
  
    return (
      <>
        <div className="pageContainer">
          <header>
            <p className="pageHeader">
              Welcome back
            </p>
          </header>
          
            <form onSubmit={onSubmit}>
                <input type="text" className='nameInput' placeholder='Name' id='name' value={name} onChange={onChange}/>
                <input type="email" className='emailInput' placeholder='Email' id='email' value={email} onChange={onChange}/>
              
              <div className="passwordInputDiv">
                <input type={showPassword ? 'text' : 'password'} className='passwordInput' placeholder='Password' id='password' value={password} onChange={onChange}/>

                <img className='showPassword' src={visibilityIcon} alt="show password" onClick={() => setShowPassword((prevstate) => !prevstate)}/>
              </div>
              
              <div className="signUpBar">
                <p className="signUpText">Sign Up</p>
                <button className="signUpButton">
                  <ArrowRightIcon fill='white' width='34px' height='34px' type='submit'/>
                </button>
              </div>
            </form>

          {/* Google OAuth */}
          <OAuth />

          <Link to='/sign-in' className='registerLink'>Or: Sign In</Link>
        </div>
      </>
    )
  }
  
  export default SignUp