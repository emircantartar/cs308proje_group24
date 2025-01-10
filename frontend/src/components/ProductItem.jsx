import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const ProductItem = ({id,image,name,price,originalPrice,discountRate}) => {
    
    const {currency} = useContext(ShopContext);

  return (
    <Link onClick={()=>scrollTo(0,0)} className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className='relative overflow-hidden'>
        <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
        {discountRate > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
            {discountRate}% OFF
          </div>
        )}
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <div className="flex items-center gap-2">
        <p className='text-sm font-medium'>{currency}{Number(price).toFixed(2)}</p>
        {discountRate > 0 && (
          <p className='text-sm text-gray-500 line-through'>{currency}{Number(originalPrice).toFixed(2)}</p>
        )}
      </div>
    </Link>
  )
}

export default ProductItem
