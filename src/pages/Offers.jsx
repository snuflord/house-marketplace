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
    const [lastFetchedListing, setLastFetchedListing] = useState(null)

    const params = useParams()

    useEffect(() => {

        const fetchListings = async () => {

            try {
            const listingsRef = collection(db, 'listings')
  
            // this query selector checks the listingsRef (the listings collection in firebase) and then checks if key 'offer' is true
            const q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc',), limit(2))
            
            // the get Docs method will then fetch documents that match those that include 'offer' as true
            const querySnap = await getDocs(q)

            const listings = []
  
            querySnap.forEach((doc) => {
                // for each document, add the id and data returned from each document to the empty listings array.
                return listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            })
            // update the state to include the updated listings array - now we can loop through each listing in the array to create listingItems for each. 
            setListings(listings)
            setLoading(false)
            } catch (error) {
                toast.error('Could not find listing')
            }
            
        }
        fetchListings()
    }, [])

     // PAGINATION FUNCTION - for notes, see same function in 'Category.jsx'
     const fetchMoreOffers = async () => {

        try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, where('offer', '==', true), orderBy('timestamp', 'desc',), startAfter(lastFetchedListing), limit(10))
        const querySnap = await getDocs(q)
        const lastVisibleDoc = querySnap.docs[querySnap.docs.length - 1] 
        setLastFetchedListing(lastVisibleDoc)

        const listings = []
        querySnap.forEach((doc) => {
            return listings.push({
                id: doc.id,
                data: doc.data()
            })
        })
        
        setListings((prevState) => [...prevState, ...listings])
        setLoading(false)
        } catch (error) {
            toast.error('Could not find listing')
        }
    }


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
            <br />
            <br />
            {lastFetchedListing && (
                <p className="loadMore" onClick={fetchMoreOffers}>Load More</p>
            )}
        </> : <p>No current offers available.</p>}
    </div>
  )
}

export default Offers