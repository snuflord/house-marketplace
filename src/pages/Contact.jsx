import {useState, useEffect} from 'react'
import {useParams, useSearchParams} from 'react-router-dom'
import {getDoc, doc} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'

function Contact() {

    const [message, setMessage] = useState('')
    const [landlord, setLandlord] = useState(null)
    const [searchParams, setSearchParams] = useSearchParams()

    const params = useParams()

    useEffect(() => {
        const getLandlord = async () => {
            const docRef = doc(db, 'users', params.landlordId)
            const docSnap = await getDoc(docRef)

            if(docSnap.exists()) {
                // update listing state with the returned listing data
                // console.log(docSnap.data())
                setLandlord(docSnap.data())
                
            } else {
                toast.error('Cannot find seller')
            }
        }
        
        getLandlord()
    }, [params.landlordId])

    const onChange = (e) => {
        setMessage(e.target.value)
    }

  return (
    <div className="pageContainer">
        <header>
            <div className="pageHeader">Contact Seller</div>

            {landlord !== null && (
                <main>
                    <div className="contactLandlord">
                        <p className="landlordName">Contact {landlord?.name}</p>
                    </div>
                    <form className="messageForm">
                        <div className="messageDiv">
                        <label htmlFor="message" className='messageLabel'>Message</label>
                        <textarea name="message" id="message" className='textarea' value={message} onChange={onChange}></textarea>
                        </div>
                        {/* searchParams.getListingNmae is listing.name defined in the Link url search param in Listing */}
                        <a href={`mailto:${landlord.email}?Subject=${searchParams.get('listingName')}&body=${message}`}>
                            <button type='button' className="contactButton">Send Inquiry</button>
                        </a>
                    </form>
                </main>
            )}
        </header>
    </div>
  )
}

export default Contact