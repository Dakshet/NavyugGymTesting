import React, { useContext, useEffect } from 'react'
import GymContext from '../context/Gym/GymContext'
import "./DeadlinePannel.css"
import DeadlinePannelInner from '../Components/DeadlinePannelInner'
import { useNavigate } from 'react-router-dom'

const DeadlinePannel = () => {

    const navigate = useNavigate();

    const { membershipData, setMembershipData, fetchMembershipStatusUserData } = useContext(GymContext)

    useEffect(() => {
        if (localStorage.getItem("gymdata")) {
            fetchMembershipStatusUserData();
        }
        else {
            navigate("/admin")
        }
        // eslint-disable-next-line
    }, [])


    useEffect(() => {
        if (membershipData === 0) {
            navigate("/admin")
            setMembershipData(1)
        }
    }, [membershipData, navigate, setMembershipData])


    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - Membership Dashboard";  // Set the document title to the news title
    }, []);


    if (!membershipData || membershipData.length === 0) {
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

    return (
        <>
            {/* {membershipData.length === 0 ? "" : ""} */}
            {/* <div className="dumbbell-container">
                <div className="dumbbell">
                    <div className="weightScrew" id='leftSide'>
                        <div className="wavex"></div>
                    </div>
                    <div className="weight">
                        <div className="wavex"></div>
                    </div>
                    <div className="handle">
                        <p>Navyug Gym</p>
                    </div>
                    <div className="weight">
                        <div className="wavex"></div>
                    </div>
                    <div className="weightScrew" id='rightSide'>
                        <div className="wavex"></div>
                    </div>
                </div>
            </div> */}
            <div className='membershipPannel'>
                <h1>Membership Dashboard ({membershipData === 1 ? "0" : membershipData.length})</h1>
                <hr />
                {membershipData === 1 ? (<p className='emptyParaMsg'>All memberships are up to date.</p>) : <div className="membershipPannelBox">
                    {membershipData.map((data, index) => {
                        return <DeadlinePannelInner key={index} data={data} />
                    })}

                </div>}
            </div>
        </>
    )
}

export default DeadlinePannel
