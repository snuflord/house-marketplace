import {useState, useEffect, useRef} from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage'
import {getDoc, serverTimestamp, doc, updateDoc} from 'firebase/firestore'
import {db} from '../firebase.config'
import {v4 as uuidv4} from 'uuid'
import {useNavigate, useParams} from  'react-router-dom'
import Spinner from '../components/Spinner'
import {toast} from 'react-toastify'

// This component is similar to createlisting, but instead populates the inputs with the details of the listinng chosen to be edited. It then runs updateDoc function instead of addDoc - see lines 252-253

function EditListing() {

    const [listing, setListing] = useState(false)
    const [geolocEnabled, setGeolocEnabled] = useState(true)
    const [active, setButtonText] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: 'rent',
        name: '',
        description: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: '',
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0,
    })

    const { type,
            name,
            description,
            bedrooms,
            bathrooms,
            parking,
            furnished,
            address,
            offer,
            regularPrice,
            discountedPrice,
            images,
            latitude,
            longitude } = formData

    const auth = getAuth()
    const navigate = useNavigate()
    const params = useParams()
    const isMounted = useRef(true)

    // redirect if listing does not belong to user
    useEffect(()=> {
        if(listing && listing.useRef !== auth.currentUser.uid) {
            toast.error('You cannot edit this listing')
            navigate('/')
        }
    })

    // fetch listing to edit
    useEffect(() => {
        setLoading(true)
        const fetchListing = async () => {
            const docRef = doc(db, 'listings', params.listingId)
            const docSnap = await getDoc(docRef)
            if(docSnap.exists) {
                setListing(docSnap.data())
                setFormData({
                    ...docSnap.data(), 
                    address: docSnap.data().location,
                    // would like to update images but cannot figure functionality at this stage.
                })
                setLoading(false)
            } else {
                navigate('/')
                toast.error('Listing does not exist')
            }
        }
        fetchListing()
    }, [navigate, params.listingId])

    // Sets useRef to logged in user
    useEffect(() => {
        if(isMounted) {
            onAuthStateChanged(auth, (user) => {
                if(user) {
                    // useRef is the userReference, stored in firebase > listings, added and updated here with the unique id of the user
                    setFormData({...formData, useRef: user.uid})
                } else {
                    navigate('/sign-in')
                }
            })
        }
        return () => {
            isMounted.current = false
        }
    }, [isMounted])

    // ON MUTATE handles updating formData based on user input: changing bools, updating numbers and text.
    const onMutate = (e) => {
        let boolean = null
        // here bools apply to parking, furnished, and offer
        if(e.target.value === 'true') {
            boolean = true
        }
        if(e.target.value === 'false') {
            boolean = false
        }
        // updating image files in state
        if(e.target.files) {
            setFormData((prevstate) => ({
                ...prevstate,
                images: e.target.files
            }))
        }
        // Text/bools/numbers
        if(!e.target.files) {
            setFormData((prevstate) => ({
                // spread operator across previous array (empty formData)
                ...prevstate,
                // here the coalescing operator (??) - if whatever to the left is not null, use boolean, otherwise, use e.target.value (text or number) - update formData with the values of each e.target.id value.
                [e.target.id]: boolean ??  e.target.value
            }))
        }
    }

    // Handle toggling manual geolocation entry fields. 
    const onButtonClick = () => {
            setGeolocEnabled(prevstate => !prevstate)
            setButtonText(!active)
    }
    

    // ON SUBMIT Commits all user input data handled by onMutate to create a new listing
    const onSubmit = async function (e) {
        e.preventDefault()
        
        setLoading(true)
        // throw error
        if(discountedPrice >= regularPrice) {
            setLoading(false)
            toast.error('Please check your pricing: discounted price cannot be greater than regular price')
            return false
        }
        // prevent more than 6 image upload
        if(images.length >  6) {
            setLoading(false)
            toast.error('You may upload 6 images maximum')
            return false
        }

        let geolocation = {}
        // declaring location field, which will append to formdata
        let location
        // if geoloc is enabled (true) - fetch geocode data with address input by user.
        if(geolocEnabled) {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`)

            // export response as data
            const data = await response.json()
            console.log(data)
            
            // setting geolocation object specifics (lat/lng) to data response
            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
            geolocation.lng = data.results[0]?.geometry.location.lng ?? 0
            // address is location returned from geocode
            location = data.status === 'ZERO_RESULTS' ? undefined :
            data.results[0]?.formatted_address

            // if no location can be found, error
            if(location === undefined || location.includes('undefined')) {
                setLoading(false)
                toast.error('Cannot find address')
            }
            // if !gelocEnabled
        } else {
            geolocation.lat = latitude
            geolocation.lng = longitude
            // location is address that is typed in
            
        }

        // STORE IMAGES IN FIREBASE - https://firebase.google.com/docs/storage/web/upload-files

        // this store image function stores on image at a time. it runs as a Promise considering that storing (uploading) may take some time and we do not want to block the execution of other functionality. 
        const storeImage = async (image) => {
            return new Promise((resolve, reject) => {
                // exporting getstorage method as storage
                const storage = getStorage()
                // creating a filename for images by concatenating the current user, the image name (the name of the image files passed in), and a unique id imported from uuidv4.
                const fileName = `${auth.currentUser.uuidv4}-${image.name}-${uuidv4()}`

                // declaring a storage reference object that exports a reference to the getstorage method, which makes a new collection called 'images' that contains each instance of image created. We find these images in the firebase console > storage > files >images > $files
                const storageRef = ref(storage, 'images/' + fileName)

                // exporting the upload method as uploadTask, which the filename and the image itself
                const uploadTask = uploadBytesResumable(storageRef, image)

                // some functionality for checking upload progress or error
                uploadTask.on('state_changed', 
                (snapshot) => {
                 
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  console.log('Upload is ' + progress + '% done');
                  switch (snapshot.state) {
                    case 'paused':
                      console.log('Upload is paused');
                      break;
                    case 'running':
                      console.log('Upload is running');
                      break;
                  }
                }, 
                (error) => {
                    // if there is an error, handle the reject method in the Promise
                  reject(error)
                }, 
                // otherwise run a function: getDownloadURL, which takes in the uploadTask. Returning the downLoadURL for one image
                () => {
                  getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL)
                  });
                }
              );
            })
        }
        // to process up to 6 images with the above functionality:
        const imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
          ).catch(() => {
            setLoading(false)
            toast.error('Images not uploaded')
            return
          })

        const formDataCopy = {
            ...formData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp()
        }
        // setting location equal to address field
        formDataCopy.location = address
        delete formDataCopy.images
        delete formDataCopy.address
        
        // if there's not an offer, remove discounted price key from formdatacopy
        !formDataCopy.offer && delete formDataCopy.discountedPrice

        const docRef = doc(db, 'listings', params.listingId)
        await updateDoc(docRef, formDataCopy)

        setLoading(false)
        toast.success('Listing successful!')
        // this navigate method goes to each created listing based on its type (rent or sell) and its unique docref id.
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)
    } 

    // OUTPUT
    if(loading) {
        return <Spinner />
    }

    return (
    <div className="pageContainer">
        <header className="pageHeader">Edit your Listing</header>

        <main>
            <form onSubmit={onSubmit}>
                <label className="formLabel">Sell / Rent</label>
                <div className="formButtons">
                    <button type='button' className={type === 'sale' ? 'formButtonActive' : 'formButton'} id='type' value='sale' onClick={onMutate}>Sell</button>

                    <button type='button' className={type === 'rent' ? 'formButtonActive' : 'formButton'} id='type' value='rent' onClick={onMutate}>Rent</button>
                </div>
                <label className="formLabel">Title</label>
                <input className='formInputName' type="text" id='name' value={name} onChange={onMutate} maxLength='32' minLength='10' required/>
            

                <div className="formRooms flex">
                    <div>
                        <label className="formLabel">Bedrooms</label>
                        <input className='formInputSmall' type="number" id='bedrooms' value={bedrooms} onChange={onMutate} min='1' max='50' required/>
                    </div>
                    <div>
                        <label className="formLabel">Bathrooms</label>
                        <input className='formInputSmall' type="number" id='bathrooms' value={bathrooms} onChange={onMutate} min='1' max='50' required/>
                    </div>
                </div>
                
                <label className="formLabel">Enter description</label>
                <textarea className='formInputAddress' type='text' id='description' value={description} onChange={onMutate} required />

                <div>
                    <label className="formLabel">Parking</label>
                    <div className="formButtons">
                        <button className={parking ? 'formButtonActive' : 'formButton'} type='button' id='parking' value={true} onClick={onMutate} min='1' max='50'>Yes</button>
                        <button className={!parking && parking !== null ? 'formButtonActive' : 'formButton'} type='button' id='parking' value={false} onClick={onMutate}>No</button>
                    </div>
                </div>

                <div>
                    <label className="formLabel">Furnished</label>
                    <div className="formButtons">
                        <button className={furnished ? 'formButtonActive' : 'formButton'} type='button' id='furnished' value={true} onClick={onMutate} min='1' max='50'>Yes</button>
                        <button className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'} type='button' id='furnished' value={false} onClick={onMutate}>No</button>
                    </div>
                </div>

                <label className="formLabel">Enter address</label>
                <textarea className='formInputAddress' type='text' id='address' value={address} onChange={onMutate} required />
                
                {!geolocEnabled && (
                    <div>
                        <div>
                            <label className="formLabel">Location</label>
                            <input className='formInputSmall' type="number" id='latitude' value={latitude} onChange={onMutate} required />
                        </div>
                        <div>
                            <label className="formLabel">Location</label>
                            <input className='formInputSmall' type="number" id='longitude' value={longitude} onChange={onMutate} required />
                        </div>
                    </div>
                )}

                <button className={active ? 'formButtonActive' : 'formButton'} onClick={onButtonClick}>{active ? 'Hide manual co-ordinates' : 'Or enter manual co-ordinates'}</button>

                <div>
                    <label className="formLabel">Offer</label>
                    <div className="formButtons">
                        <button className={offer ? 'formButtonActive' : 'formButton'} type='button' id='offer' value={true} onClick={onMutate}>Yes</button>
                        <button className={!offer && offer !== null ? 'formButtonActive' : 'formButton'} type='button' id='offer' value={false} onClick={onMutate}>No</button>
                    </div>
                </div>

                <label className='formLabel'>Regular Price</label>
                <div className='formPriceDiv'>
                    <input className='formInputSmall' type='number' id='regularPrice' value={regularPrice} onChange={onMutate} min='50' max='750000000' required/>
                    {type === 'rent' && <p className='formPriceText'>£ / Month</p>}
                </div>

                {offer && (
                    <>
                    <label className='formLabel'>Discounted Price</label>
                    <input className='formInputSmall' type='number' id='discountedPrice' value={discountedPrice}onChange={onMutate} min='50' max='750000000' required={offer}/>
                    </>
                )}

                <label className='formLabel'>Images</label>
                <p className='imagesInfo'>The first image will be the cover (max 6).</p>
                <input className='formInputFile' type='file' id='images' onChange={onMutate} max='6' accept='.jpg,.png,.jpeg' multiple required />
                <button type='submit' className='primaryButton createListingButton'>Update Listing</button>
            </form>
        </main>
    </div>
  )
}

export default EditListing