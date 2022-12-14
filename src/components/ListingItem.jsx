import {Link} from 'react-router-dom'
import {ReactComponent as DeleteIcon} from '../assets/svg/deleteIcon.svg'
import {ReactComponent as EditIcon} from '../assets/svg/editIcon.svg'
import bedIcon from '../assets/svg/bedIcon.svg'
import bathtubIcon from '../assets/svg/bathtubIcon.svg'

// PREVIEW LISTING ITEM

function ListingItem({listing, id, onDelete, onEdit}) {

  return (
    <>
    <li className='categoryListing'>
        {/* navigate path for each listing takes in the listing type (rent/sale) and unique id, returned from getDoc in 'Category */}
        <Link to={`/category/${listing.type}/${id}`} className='categoryListingLink'>
            <img src={listing.imgUrls} alt={listing.name} className='categoryListingImg' />
            <div className="categoryListingDetails">
                <p className="categoryListingLocation">
                    {listing.location}
                </p>
                <p className="categoryListingName">
                    {listing.name}
                </p>
                <p className="categoryListingPrice">
                    {/* ternary to display either a discounted price or regular price */}
                    {listing.offer ? 'Offer: £' + listing.discountedPrice : 'Price: £' + listing.regularPrice}
                    {listing.type === 'rent' && ' per month'}
                </p>
                <div className="categoryListingInfoDiv">
                    <img src={bedIcon} alt="bed" />
                    <p className="categoryListingInfoText">
                        {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : '1 Bedroom'}
                    </p>
                    <img src={bathtubIcon} alt='bath'/>
                    <p className="categoryListingInfoText">
                        {listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : '1 Bathroom'}
                    </p>
                </div>
            </div>
        </Link>
        {onDelete && (
            <DeleteIcon className='removeIcon' fill='rgb(231, 76, 60)' onClick={() => {
                onDelete(listing.id, listing.name)
            }}/>
        )}
        {onEdit && (
            <EditIcon className='editIcon' fill='rgb()' onClick={() => {
                onEdit(listing.id, listing.name)
            }}/>
        )}
    </li>
    </>
    
  )
}

export default ListingItem