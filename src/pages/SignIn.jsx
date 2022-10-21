import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import { getAuth, signInWithEmailAndPassword, sendEmailVerification} from 'firebase/auth'
import {toast} from 'react-toastify'
import OAuth from '../components/OAuth'


function SignIn() {
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  // Destructuring objects from formData
  const {email, password} = formData

  const navigate = useNavigate()

  const onChange = (e) => {
    setFormData((prevstate) => ({
      // spread operator across previous state
      ...prevstate,
      // targeting id of either email or password, then replacing previous formData state with new input.
      [e.target.id]: e.target.value
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      //
      const auth = getAuth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
        if(userCredential.user) {
        navigate('/profile')
        sendEmailVerification(auth.currentUser)
      }
    } catch (error) {
      // toast error message
      toast.error('Incorrect user credentials') 
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
                  <input type="email" className='emailInput' placeholder='Email' id='email' value={email} onChange={onChange}/>
                <div className="passwordInputDiv">
                  <input type={showPassword ? 'text' : 'password'} className='passwordInput' placeholder='Password' id='password' value={password} onChange={onChange}/>

                  <img className='showPassword' src={visibilityIcon} alt="show password" onClick={() => setShowPassword((prevstate) => !prevstate)}/>
                </div>
                <Link to='/forgot-password' className='forgotPasswordLink'>Forgot Password</Link>
                <div className="signInBar">
                  <p className="signInText">Sign In</p>
                  <button className="signInButton">
                    <ArrowRightIcon fill='white' width='34px' height='34px' />
                  </button>
                </div>
            </form>

          {/* Google OAuth */}
          <OAuth />

          <Link to='/sign-up' className='registerLink'>Sign Up</Link>
        </div>
      </>
    )
  }
  
  export default SignIn