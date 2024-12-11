import React, { useContext, useEffect } from 'react'
import "./SubscriptionEnd.css"
import GymContext from '../context/Gym/GymContext'
import SubscriptionEndInner from '../Components/SubscriptionEndInner';
import { useNavigate } from 'react-router-dom';

const SubscriptionEnd = () => {

    const navigate = useNavigate();

    const { subscriptionEnd, setSubscriptionEnd, fetchSubscriptionEndUserData } = useContext(GymContext);

    useEffect(() => {
        if (localStorage.getItem("gymdata")) {
            fetchSubscriptionEndUserData()
        }
        else {
            navigate("/admin")
        }
        // eslint-disable-next-line 
    }, [])


    useEffect(() => {
        if (subscriptionEnd === 0) {
            navigate("/admin")
            setSubscriptionEnd(1)

        }
    }, [subscriptionEnd, navigate, setSubscriptionEnd])


    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - Membership End Dashboard";  // Set the document title to the news title
    }, []);


    if (!subscriptionEnd || subscriptionEnd.length === 0) {
        return (
            <div className="dumbbell-container" >
                <div className="dumbbell">
                    <div className="weightScrew" id='leftSide'>
                        <div className="wavex"></div>
                    </div>
                    <div className="weight">
                        <div className="wavex"></div>
                    </div>
                    <div className="handle">
                        <div className="wavexy">
                            <p>Navyug Gym</p>
                        </div>
                    </div>
                    <div className="weight">
                        <div className="wavex"></div>
                    </div>
                    <div className="weightScrew" id='rightSide'>
                        <div className="wavex"></div>
                    </div>
                </div>
            </div >
        )
        // Handle case when news is not yet available
    }


    // console.log(subscriptionEnd)
    return (
        <div className='subscriptionEnd'>
            <h1>Membership End Dashboard ({subscriptionEnd === 1 ? "0" : subscriptionEnd.length})</h1>
            <hr />
            {subscriptionEnd === 1 ? (<p className='emptyParaMsg'>No recent expirations.</p>) : <div className="subscriptionEndBox">
                {subscriptionEnd.map((data, index) => {
                    return <SubscriptionEndInner key={index} data={data} />
                })}
            </div>}
        </div>
    )
}

export default SubscriptionEnd
