import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router'
function Home() {

   
  return (
    <div>
        <Link to={"login"} className='border-1 p-2 bg-red-600 text-white'>Login</Link>
    </div>
  )
}

export default Home