import {useEffect, useState} from 'react' 
import {useParams} from 'react-router-dom'
import {collection, getDocs, query, where, orderBy, limit, startAfter} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
 
function Category() {

    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)

    // use params allows us to check the :categoryName route specified in app.js - the specific routes 
    const params = useParams()

    useEffect(() => {
        const fetchListings = async () => {

            try {
                //get reference to listings table
            const listingsRef = collection(db, 'listings')
            // get a query - takes collection returned to listingsRef and queries the type == params.CategoryName, specifed in App.js
            const q = query(listingsRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc',), limit(10))

            // execute query (q) = this function will get the documents specific to the query above. In this case, it will return for sale or for rent pages.
            const querySnap = await getDocs(q)

            // create listings array
            const listings = []
            // for each document equal to the query above, add the data and an id to listings array.
            querySnap.forEach((doc) => {
                // for each doc, add new object with id and data
                return listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            })
            // set listings overrides null state with populated array
            setListings(listings)
            // set loading to false once we have the data
            setLoading(false)

            } catch (error) {
                toast.error('Could not find listing')
            }
            
        }
        // execute fetchListings
        fetchListings()
    }, [])


  return (
    <div className='category'>
        <header>
            <p className="pageHeader">
                {params.categoryName === 'rent' ? 'Places for rent' : 'Places for sale'}
            </p>
        </header>
        {/* if loading, show spinner, otherwise show listings if there are more than 0, otherwise show message */}
        {loading ? <Spinner/> : listings && listings.length > 0 ? <>
            <main>
                <ul className='categoryListings'>
                    {listings.map((listing) => (
                        <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                    ))}
                </ul>
            </main>
        </> : <p>No listings for {params.categoryName}</p>}
    </div>
  )
}

export default Category