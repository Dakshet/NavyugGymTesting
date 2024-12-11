import React, { useEffect, useState } from 'react'
import "../Pages/SubscriptionEnd.css"
import { useMediaQuery } from 'react-responsive';
import SubscriptionEndModal from './SubscriptionEndModal';

const SubscriptionEndInner = ({ data }) => {

    const [openSubscriptionEndPannelInfo, setOpenSubscriptionEndPannelInfo] = useState("");
    const [dateDiff, setDateDiff] = useState("");


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


    // Date Difference
    useEffect(() => {

        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split("-");
            return new Date(year, month - 1, day); // Month is zero-based in JavaScript's Date
        };

        const date2 = parseDate(data[6]);
        const date1 = new Date();        //current Date


        const dateDiffInMilliseconds = date1 - date2;
        const dateDiffInDays = Math.floor(dateDiffInMilliseconds / (1000 * 60 * 60 * 24));

        setDateDiff(dateDiffInDays);

    }, [data])


    return (
        <>
            <SubscriptionEndModal data={data} dateDiff={dateDiff} openSubscriptionEndPannelInfo={openSubscriptionEndPannelInfo} setOpenSubscriptionEndPannelInfo={setOpenSubscriptionEndPannelInfo} />
            <div className='subscriptionEndInner' onClick={() => setOpenSubscriptionEndPannelInfo(true)}>
                {/* <div className='deadlinePannelInner' > */}
                <div className="subscriptionEndInnerBox">
                    <h5>Name: {data[0].toUpperCase()}</h5>
                    <h6>Phone no: +91 {data[2]}</h6>
                    <h6>Address: {data[3].split(" ").slice(0, wordCount).join(" ") + "..."}</h6>
                    <div>
                        <h6>Membership Start: {data[5]}</h6>
                        <h6>Membership End: {data[6]}</h6>
                    </div>
                    {dateDiff === 15 ? (<h6>Expires in: <span>Payment period of 15 days is over.</span></h6>) : (<h6>Expires in: <span>Fees are {dateDiff} days late.</span></h6>)}
                </div>
            </div >
        </>
    )
}

export default SubscriptionEndInner
