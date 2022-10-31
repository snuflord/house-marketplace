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
    const [lastFetchedListing, setLastFetchedListing] = useState(null)

    // use params allows us to check the :categoryName route specified in app.js - the specific routes 
    const params = useParams()

    useEffect(() => {
        const fetchListings = async () => {

            try {
                //get reference to listings table
            const listingsRef = collection(db, 'listings')
            // get a query - takes collection returned to listingsRef and queries the type == params.CategoryName, specifed in App.js - then looks at path in explore.jsx - here the query will return either properties for rent or properties for sale. == only - not strict equality here. 
            const q = query(listingsRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc',), limit(10))

            // execute query (q) = this function will get the documents specific to the query above. In this case, it will return for sale or for rent pages.
            const querySnap = await getDocs(q)

            // if we retrieve 10 docs, this variable will hold the last one 
            const lastVisibleDoc = querySnap.docs[querySnap.docs.length - 1]
            // updating state to last visible doc. 
            setLastFetchedListing(lastVisibleDoc)

            // create listings array
            const listings = []
            // for each document equal to the query above, add the data and an id to listings array.
            querySnap.forEach((doc) => {
                // for each doc, add new object with id and the data returned from getDocs
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
        // execute fetchListings on page load
        fetchListings()
    }, [params.categoryName])

    // PAGINATION FUNCTION
    const fetchMoreListings = async () => {

        try {
        const listingsRef = collection(db, 'listings')
        // Here we are querying listings as above; however, the limit here is the number of additional listings to be fetched and appended to the already displayed listings. 
        const q = query(listingsRef, where('type', '==', params.categoryName), orderBy('timestamp', 'desc',), startAfter(lastFetchedListing), limit(10))
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
        // Here we ADD the next 10 listings to the already populated listings array.
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
            <br />
            <br />
            {lastFetchedListing && (
                <p className="loadMore" onClick={fetchMoreListings}>Load More</p>
            )}

        </> : <p>No listings for {params.categoryName}</p>}
    </div>
  )
}

export default Category