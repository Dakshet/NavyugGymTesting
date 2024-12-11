import React, { useContext, useEffect, useState } from 'react'
import "./MonthTimer.css"
import GymContext from '../context/Gym/GymContext'

const MonthTimer = () => {

    const { homeAdminData, fetchDays, fetchDaysForSubscriptionEnd } = useContext(GymContext);
    const [dateDiff, setDateDiff] = useState();

    useEffect(() => {
        fetchDaysForSubscriptionEnd()
        // eslint-disable-next-line 
    }, [homeAdminData])


    // Date Difference
    useEffect(() => {

        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split("-");
            return new Date(year, month - 1, day); // Month is zero-based in JavaScript's Date
        };

        const date2 = parseDate(fetchDays);
        const date1 = new Date();        //current Date


        const dateDiffInMilliseconds = date1 - date2;
        const dateDiffInDays = Math.floor(dateDiffInMilliseconds / (1000 * 60 * 60 * 24)) * (-1);

        setDateDiff(dateDiffInDays);

    }, [fetchDays])



    return (
        <div className='monthTimmer'>
            <div className="monthTimmerInner">
                <p>Left {fetchDays.length === 0 ? "0" : dateDiff} Days</p>
            </div>
        </div>
    )
}

export default MonthTimer
