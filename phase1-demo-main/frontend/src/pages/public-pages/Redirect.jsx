import React from 'react'
import { useEffect } from 'react';
import { useNavigate } from 'react-router'

function Redirect() {

    // Redirecting to "/unified-health-tech"
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/unified-health-tech")
    })
    return (
        <div></div>
    )
}

export default Redirect