import React, { useContext, useEffect } from 'react'
import "./AdminHome.css"
import GymContext from '../context/Gym/GymContext'
import { useNavigate } from 'react-router-dom'

const AdminHome = () => {

    const navigate = useNavigate();

    const { homeAdminData, setHomeAdminData, fetchHomeAdminData } = useContext(GymContext);

    useEffect(() => {
        if (localStorage.getItem("gymdata")) {
            fetchHomeAdminData()
        }
        else {
            navigate("/admin");
        }
        // eslint-disable-next-line
    }, [])


    useEffect(() => {
        if (homeAdminData === 0) {
            navigate("/admin")
            setHomeAdminData(1)
        }
    }, [homeAdminData, navigate, setHomeAdminData])


    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - Home";  // Set the document title to the news title
    }, []);


    if (!homeAdminData || homeAdminData.length === 0) {
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
        <div className='adminHome'>
            <div className="adminHomeBox">
                <h1>Welcome {homeAdminData.adminFirstName}...</h1>
                <h5>Total Memberships</h5>
                <hr />
                <div className="adminHomeBoxInner">
                    <h6>Total Membership : <span>{homeAdminData.totalMembers}</span></h6>
                    <h6>Total Insider Member : <span>{homeAdminData.insiderMembers}</span></h6>
                    <h6>Total Outsider Member : <span>{homeAdminData.outsiderMembers}</span></h6>
                </div>
                <h5>Membership Sessions</h5>
                <hr />
                <div className="adminHomeBoxInner">
                    <h6>Morning Members : <span>{homeAdminData.morningMembers}</span></h6>
                    <h6>Evening Members : <span>{homeAdminData.eveningMembers}</span></h6>
                </div>
                <h5>Age Categories</h5>
                <hr />
                <div className="adminHomeBoxInner">
                    <h6>Members Below 15 Age : <span>{homeAdminData.membersBelowFifteen}</span></h6>
                    <h6>Members Between (15-20)Age : <span>{homeAdminData.fifteenToTwenty}</span></h6>
                    <h6>Members Between (20-30)Age : <span>{homeAdminData.twentyToThirty}</span></h6>
                    <h6>Members Above 30 Age : <span>{homeAdminData.membersAboveThirty}</span></h6>
                </div>
            </div>
        </div>
    )
}

export default AdminHome
