import {useEffect, useState} from 'react' 
import {useParams} from 'react-router-dom'
import {collection, getDocs, query, where, orderBy, limit, startAfter} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
 
// comments for explanations of cuntions on this page can be found in 'Category.jsx
function Offers() {

    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)

    const params = useParams()

    useEffect(() => {

        const fetchListings = async () => {

            try {
      
            const listingsRef = collection(db, 'listings')
  
            const q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc',), limit(10))
  
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

            } catch (error) {
                toast.error('Could not find listing')
            }
            
        }
        fetchListings()
    }, [])


  return (
    <div className='category'>
        <header>
            <p className="pageHeader">
               Offers
            </p>
        </header>
        {loading ? <Spinner/> : listings && listings.length > 0 ? <>
            <main>
                <ul className='categoryListings'>
                    {listings.map((listing) => (
                        <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                    ))}
                </ul>
            </main>
        </> : <p>No current offers available.</p>}
    </div>
  )
}

export default Offers