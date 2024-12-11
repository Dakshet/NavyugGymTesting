import React, { useEffect } from 'react'
import "./Waiting.css"

const Waiting = () => {


    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - Welcome";  // Set the document title to the news title
    }, []);

    return (
        <div className='waiting'>
            <h2>Welcome to Navyug Gym</h2>
            <p>Once you've been authorized by our Gym Authority, you will receive a confirmation email.</p>
        </div>
    )
}

export default Waiting
