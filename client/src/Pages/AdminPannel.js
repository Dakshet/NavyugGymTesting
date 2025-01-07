import React, { useContext, useEffect } from 'react'
import "./AdminPannel.css"
import GymContext from '../context/Gym/GymContext'
import AdminPannelInner from '../Components/AdminPannelInner'
import { useNavigate } from 'react-router-dom'


const AdminPannel = () => {
    const navigate = useNavigate();

    const { pendingData, setPendingData, fetchFeesPendingData } = useContext(GymContext)

    useEffect(() => {
        if (localStorage.getItem("gymdata")) {
            fetchFeesPendingData();
        }
        else {
            navigate("/admin")
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (pendingData === 0) {
            navigate("/admin")
            setPendingData(1)

        }
    }, [pendingData, navigate, setPendingData])



    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - New Application Requests";  // Set the document title to the news title
    }, []);


    // console.log(pendingData)
    if (!pendingData || pendingData.length === 0) {
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
        <div className='adminPanel'>
            <h1>New Applications ({pendingData === 1 ? "0" : pendingData.length})</h1>
            <hr />
            {pendingData === 1 ? (<p className='emptyParaMsg'>You're up to date! No new requests.</p>) :
                <div className="adminPanelBox">
                    {pendingData.map((data, index) => {
                        return <AdminPannelInner key={index} data={data} pendingData={pendingData} setPendingData={setPendingData} />
                    })}
                </div>}
        </div>
    )
}

export default AdminPannel
