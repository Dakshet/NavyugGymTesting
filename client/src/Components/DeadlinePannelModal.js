import React, { useContext, useEffect } from 'react'
import "./DeadlinePannelModal.css"
import GymContext from '../context/Gym/GymContext';

const DeadlinePannelModal = ({ data, dateDiff, openDeadlinePannelInfo, setOpenDeadlinePannelInfo }) => {


    const { imageBase64, fetchUserImage } = useContext(GymContext);


    useEffect(() => {
        if (openDeadlinePannelInfo) {
            fetchUserImage(data[4]); // Pass user-specific identifier if needed
        }
        // eslint-disable-next-line
    }, [openDeadlinePannelInfo]);


    return (
        <div className={`${openDeadlinePannelInfo ? "deadlinePannelModal" : "hideDeadlinePannelModal"}`}>
            <div className='deadlinePannelModalInner'>
                <i onClick={() => setOpenDeadlinePannelInfo(false)} className="ri-close-circle-line"></i>
                <div className="deadlinePannelModalInnerBox">
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
                    {dateDiff === 0 ? (<h6>Expires in: <span>Today is the last day.</span></h6>) : (<h6>Expires in: <span>{dateDiff} Day Left</span></h6>)}
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
                        <h6>Amount: {data[12]}</h6>
                    </div>
                    <h6>Fee Receiver: {data[13]}</h6>
                </div>
            </div>
        </div >
    )
}

export default DeadlinePannelModal
