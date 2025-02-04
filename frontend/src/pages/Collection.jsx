import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { use } from 'react';

const Collection = () => {
  
  const { products , search , showSearch } = useContext(ShopContext);
  const [showFilter,setShowFilter] = useState(false);
  const [filterProducts,setFilterProducts] = useState([]);
  const [category,setCategory] = useState([]);
  const [subCategory,setSubCategory] = useState([]);
  const [sortType,setSortType] = useState('relavent')
  const {backendUrl}=useContext(ShopContext)
  const [categories, setCategories] = useState([]); // State for all categories
  const [allSubCategories, setAllSubCategories] = useState([]); // State for all subcategories
  

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/categories`);
        if (response.data.success) {
          setCategories(response.data.categories);
          // Extract all unique subcategories
          const subCats = response.data.categories.reduce((acc, cat) => {
            return [...acc, ...cat.subCategories];
          }, []);
          setAllSubCategories([...new Set(subCats)]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [backendUrl]);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setCategory(prev => [...prev, e.target.value]);
    }
  };
  


  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setSubCategory(prev => [...prev, e.target.value]);
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();
  
    if (showSearch && search) {
      productsCopy = productsCopy.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()) // Filter by description
      );
    }
  
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }
  
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }
  
    setFilterProducts(productsCopy);
  };
  
  const getCategoryCount = (categoryName) => {
    const category = categoryCounts.find((c) => c._id === categoryName); 
    return category ? category.count : 0; 
  };
  
  

  const sortProduct = () => {

    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
        break;

      default:
        applyFilter();
        break;
    }

  }
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success) {
          setCategoryCounts(response.data.categoryCounts); // Set category counts in state
        } else {
          console.error("Failed to fetch category counts:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching category counts:", error);
      }
    };
  
    fetchCategoryCounts();
  }, []);
  
  

  useEffect(()=>{
      applyFilter();
  },[category,subCategory,search,showSearch,products])

  useEffect(()=>{
    sortProduct();
  },[sortType])

  return (
    <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
      
      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {categories.map((cat) => (
              <p key={cat.category} className='flex gap-2'>
                <input
                  className='w-3'
                  type="checkbox"
                  value={cat.category}
                  onChange={toggleCategory}
                  checked={category.includes(cat.category)}
                />
                {cat.category} ({cat.count})
              </p>
            ))}
          </div>
        </div>


        {/* SubCategory Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {allSubCategories.map((subCat) => (
              <p key={subCat} className='flex gap-2'>
                <input
                  className='w-3'
                  type="checkbox"
                  value={subCat}
                  onChange={toggleSubCategory}
                  checked={subCategory.includes(subCat)}
                />
                {subCat}
              </p>
            ))}
          </div>
        </div>
      </div>
      

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={'ALL'} text2={'COLLECTIONS'} />
            {/* Porduct Sort */}
            <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
              <option value="relavent">Sort by: Relavent</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterProducts.map((item,index)=>(
              <ProductItem 
                key={index} 
                name={item.name} 
                id={item._id} 
                price={item.price} 
                image={item.image}
                originalPrice={item.originalPrice}
                discountRate={item.discountRate}
              />
            ))
          }
        </div>
      </div>

    </div>
  )
}

export default Collection
