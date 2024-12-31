import React, { useCallback, useContext, useState } from 'react'
import "../Pages/AdminPannel.css"
import { useMediaQuery } from 'react-responsive';
import AdminPannelModal from './AdminPannelModal';
import GymContext from '../context/Gym/GymContext';
import { useNavigate } from 'react-router-dom';

const AdminPannelInner = ({ data, pendingData, setPendingData }) => {

    const navigate = useNavigate();

    const [amount, setAmount] = useState("");
    const [pStatus, setPStatus] = useState("");
    const [openAddPanelUserInfo, setOpenAddPanelUserInfo] = useState("");
    const { aceeptMemberRequest, deleteMemberRequest } = useContext(GymContext);


    //Responsiveness
    const isSmallScreen = useMediaQuery({ query: '(max-width: 600px)' });
    // const isMediumScreen = useMediaQuery({ query: '(max-width: 900px)' });
    // const isLargeScreen = useMediaQuery({ query: '(min-width: 901px) and (max-width: 1200px)' });
    const isExtraLargeScreen = useMediaQuery({ query: '(min-width: 1000px)' });

    let wordCount;
    if (isSmallScreen) {
        wordCount = 3;
    } else if (isExtraLargeScreen) {
        wordCount = 5;
    }


    // Handle Submit Data
    const handleSubmitData = useCallback((e) => {
        if (pendingData === 0) {
            navigate("/admin")
            setPendingData(1)
        }
        else {
            e.preventDefault();
            aceeptMemberRequest(data[4], amount, pStatus)
            setAmount("")
            setPStatus("")
        }

    }, [aceeptMemberRequest, data, amount, pStatus, pendingData, setPendingData, navigate])


    // Handle Delete Data
    const handleDeleteData = useCallback(() => {
        if (pendingData === 0) {
            navigate("/admin")
            setPendingData(1)
        }
        else {
            deleteMemberRequest(data[4])
        }
    }, [deleteMemberRequest, data, setPendingData, pendingData, navigate])



    return (
        <>
            <AdminPannelModal data={data} openAddPanelUserInfo={openAddPanelUserInfo} setOpenAddPanelUserInfo={setOpenAddPanelUserInfo} />
            <div className='adminPannelInner'>
                <div className="adminPannelInnerBox">
                    {/* <img src="https://img.freepik.com/premium-photo/personal-fitness-avatar-realistic-white-background-style-raw-stylize-750-job-id-ee19bd69c40a4dd58c8b_343960-70963.jpg" alt="" /> */}
                    <h5 onClick={() => setOpenAddPanelUserInfo(true)}>Name: {data[0].toUpperCase()}</h5>
                    <h6 onClick={() => setOpenAddPanelUserInfo(true)}>Phone no: +91 {data[2]}</h6>
                    <h6 onClick={() => setOpenAddPanelUserInfo(true)}>Address: {data[3].split(" ").slice(0, wordCount).join(" ") + "..."}</h6>

                    <form action="" onSubmit={handleSubmitData}>
                        <div className='formInnerSelectBox'>
                            <div>
                                <label htmlFor="amount">Amount</label>
                                <select name="amount" id="amount" value={amount} required onChange={(e) => setAmount(e.target.value)}>
                                    <option value="">Select Amount:</option>
                                    <option value="2000">2000</option>
                                    <option value="5000">5000</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="pStatus">Paid Status:</label>
                                <select name="pStatus" id="pStatus" required value={pStatus} onChange={(e) => setPStatus(e.target.value)}>
                                    <option value="">Paid</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>
                        <p>Application Date: {data[5]}</p>
                        <div className='addFormBtn'>
                            <button type='button' className='adminPannelBtn' onClick={handleDeleteData}>Delete</button>
                            <button type='submit' className='adminPannelBtn' >Submit</button>
                        </div>
                    </form>
                </div >
            </div >
        </>
    )
}

export default AdminPannelInner
