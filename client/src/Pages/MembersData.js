import React, { useContext, useEffect, useState } from 'react'
import GymContext from '../context/Gym/GymContext'
import "./MembersData.css"
import DeadlinePannelInner from '../Components/DeadlinePannelInner'
import { useNavigate } from 'react-router-dom'

const MembersData = () => {

    const navigate = useNavigate();

    const { monthwiseData, setMonthwiseData, fetchDataMonthWise } = useContext(GymContext)
    const [monthNumber, setMonthNumber] = useState("1")

    useEffect(() => {
        if (localStorage.getItem("gymdata")) {
            fetchDataMonthWise(monthNumber);
        }
        else {
            navigate("/admin")
        }
        // eslint-disable-next-line
    }, [monthNumber])


    useEffect(() => {
        if (monthwiseData === 0) {
            navigate("/admin")
            setMonthwiseData(1)
        }
    }, [monthwiseData, navigate, setMonthwiseData])


    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - Membership Data";  // Set the document title to the news title
    }, []);


    if (!monthwiseData || monthwiseData.length === 0) {
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
            <div className='memberDataPannel'>
                <h1>Membership Data ({monthwiseData === 1 ? "0" : monthwiseData.length})</h1>
                <hr />
                <div className="monthwiseButtons">
                    <button onClick={() => setMonthNumber(1)}>January</button>
                    <button onClick={() => setMonthNumber(2)}>February</button>
                    <button onClick={() => setMonthNumber(3)}>March</button>
                    <button onClick={() => setMonthNumber(4)}>April</button>
                    <button onClick={() => setMonthNumber(5)}>May</button>
                    <button onClick={() => setMonthNumber(6)}>June</button>
                    <button onClick={() => setMonthNumber(7)}>July</button>
                    <button onClick={() => setMonthNumber(8)}>August</button>
                    <button onClick={() => setMonthNumber(9)}>September</button>
                    <button onClick={() => setMonthNumber(10)}>October</button>
                    <button onClick={() => setMonthNumber(11)}>November</button>
                    <button onClick={() => setMonthNumber(12)}>December</button>
                </div >
                {/* <hr /> */}
                {monthwiseData === 1 ? (<p className='emptyParaMsg'>No Data to Display.</p>) : <div className="monthwisePannelBox">
                    {monthwiseData.map((data, index) => {
                        return <DeadlinePannelInner key={index} data={data} />
                    })}

                </div>}
            </div >
        </>
    )
}

export default MembersData
