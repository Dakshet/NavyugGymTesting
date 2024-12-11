import React, { useContext, useEffect } from 'react'
import "./AdminPannelModal.css"
// import { useNavigate } from 'react-router-dom';
import GymContext from '../context/Gym/GymContext';

const AdminPannelModal = ({ data, openAddPanelUserInfo, setOpenAddPanelUserInfo }) => {


    const { imageBase64, fetchUserImage } = useContext(GymContext);


    useEffect(() => {
        if (openAddPanelUserInfo) {
            fetchUserImage(data[4]); // Pass user-specific identifier if needed
        }
        // eslint-disable-next-line
    }, [openAddPanelUserInfo]);


    return (
        <div className={`${openAddPanelUserInfo ? "adminPannelModal" : "hideAdminPannelModal"}`}>
            <div className='adminPannelModalInner'>
                <i onClick={() => setOpenAddPanelUserInfo(false)} className="ri-close-circle-line"></i>
                <div className="adminPannelModalInnerBox">
                    {imageBase64 ? (
                        <img
                            src={`${imageBase64}`}
                            alt="User"
                        />
                    ) : (
                        <p>Loading image...</p>
                    )}
                    <h4>Name: <span>{data[0].toUpperCase()}</span></h4>
                    <h5>Email Id: <span>{data[1]}</span></h5>
                    <h6>Phone No: +91 {data[2]}</h6>
                    <h6>Address: {data[3]}</h6>
                    <h6>Start Subscription: {data[5]}</h6>
                    <h6>End Subscription: {data[6]}</h6>
                    <div className="combinationData">
                        <h6>Date Of Birth: {data[7]}</h6>
                        <h6>Age: {data[8]}</h6>
                    </div>
                    <div className="combinationData">
                        <h6>Blood Group: {data[9]}</h6>
                        <h6>Workout Time: {data[10]}</h6>
                    </div>
                    <div className="combinationData">
                        <h6>Fess Paid: {data[11]}</h6>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default AdminPannelModal
