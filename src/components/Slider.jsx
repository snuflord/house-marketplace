import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {collection, getDocs, query, orderBy, limit} from 'firebase/firestore'
import {db} from '../firebase.config'
import {Swiper, SwiperSlide} from 'swiper/react'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Spinner from './Spinner'

function Slider() {

    const [loading, setLoading] = useState(true)
    const [listings, setListings] = useState(null)

    const navigate = useNavigate()

    // see Category.jsx for use of collection/query etc.
    useEffect(() => { 

            const fetchListings = async () => {
            const listingsRef = collection(db, 'listings')

            const q = query(listingsRef, orderBy('timestamp', 'desc',), limit(5))

            const querySnap = await getDocs(q)

            let listings = []

            querySnap.forEach((listing) => (
                listings.push({
                    id: listing.id,
                    data: listing.data(),
                })
            ))
        
            // console.log(listings)
            setListings(listings)
            setLoading(false)
        }
        fetchListings()
    }, [])


    
    if(loading) {
        <Spinner />
    }

    // hide slider if no listings
    if(!listings) {
        return (
            <></>
        )
    }
  
    // if there are listings...
   return listings && (
    <>
        <p className="exploreHeading">Highlights</p>
        <Swiper slidesPerView={1} pagination={{clickable: true}}>
            {listings.map(({data, id}) => (
                <SwiperSlide key={id} onClick={() => navigate(`/category/${data.type}/${id}`)}>
                    <div className="swiperSlideDiv" style={{background: `url(${data.imgUrls[0]}) center no-repeat`, backgroundSize: 'cover', minHeight: '15rem'}}>

                    <p className="swiperSlideText">{data.name}</p>
                    <p className="swiperSlidePrice">
                        £{data.discountedPrice ? data.discountedPrice : data.regularPrice}
                        {data.type === 'rent' && ' / month'}
                    </p>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    </>
  )
}

export default Slider