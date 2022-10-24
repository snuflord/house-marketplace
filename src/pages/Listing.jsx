import {useState, useEffect} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {getDoc, doc} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import {db} from '../firebase.config'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'

// INDIVIDUAL LISTING DISPLAYED WHEN SINGLE ITEM (HOUSE) IS SELECTED
 
function Listing() {
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)

    const navigate = useNavigate()
    const params = useParams()
    const auth = getAuth()

    useEffect(() => {
        const fetchListing = async () => {
            // docRef to specific ListingItems based on listingID
            const docRef = doc(db, 'listings', params.listingId)
            const docSnap = await getDoc(docRef)

            if(docSnap.exists()) {
                // update listing state with the returned listing data
                // console.log(docSnap.data())
                setListing(docSnap.data())
                setLoading(false)
            }
        }
        fetchListing()
    }, [navigate, params.listingID])


    if(loading) {
        return (
            <Spinner />
        )
    }

  return (
    <main>
        {/* SLIDER */}

        <div className="shareIconDiv">
            <img src={shareIcon} alt="share-button" onClick={() => {
                // getting the url to add to 'copy'
                navigator.clipboard.writeText(window.location.href)
                setShareLinkCopied(true)
                setTimeout(() => {
                    setShareLinkCopied(false)
                }, 2000)
            }} />
        </div>
        {shareLinkCopied && <p className='linkCopied'>Link Copied</p>}

        <div className="pageContainer">
            <p className="listingName">{listing.name} - £{listing.offer ? listing.discountedPrice : listing.regularPrice}</p>
            <p className="listingLocation">{listing.location}</p>
            <p className="listingType">For {listing.type == 'rent' ? 'Rent' : 'Sale'}</p>
            {listing.offer && <p className='discountPrice'>
                £{listing.regularPrice -listing.discountedPrice} discount!</p>}

            <ul className="listingDetailsList">
                <li>
                    {listing.bedrooms > 1 ? `${listing.bedrooms} bedrooms` : '1 Bedroom'}
                </li>
                <li>
                    {listing.bathrooms > 1 ? `${listing.bathrooms} bathrooms` : '1 bathroom'}
                </li>
                <li>
                    {listing.parking ? 'Parking: Yes' : 'Parking: No'}
                </li>
                <li>
                    {listing.furnished ? 'Furnished: Yes' : 'Furnished: No'}
                </li>
            </ul>

            <p className='listingLocationTitle'>Location</p>
            {/* MAP */}

            
            
                <Link to={`/contact/${listing.useRef}?listingName=${listing.name}`} className='primaryButton'>Contact Seller</Link>
            
        </div>
    </main>
  )
}

export default Listing