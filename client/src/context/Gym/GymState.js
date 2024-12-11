import React, { useState } from 'react'
import GymContext from './GymContext'

const GymState = (props) => {

    const host = process.env.REACT_APP_HOST_NAME;

    const [pendingData, setPendingData] = useState([]);
    const [membershipData, setMembershipData] = useState([]);
    const [homeAdminData, setHomeAdminData] = useState([]);
    const [searchUser, setSearchUser] = useState([]);
    const [subscriptionEnd, setSubscriptionEnd] = useState([]);
    const [imageBase64, setImageBase64] = useState(null);
    const [monthwiseData, setMonthwiseData] = useState([]);
    const [fetchDays, setFetchDays] = useState("");
    // const [noData, setNoData] = useState("")

    // Get fees pending data
    const fetchFeesPendingData = async () => {

        try {
            const response = await fetch(`${host}/user/admin/feespending`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth_token": localStorage.getItem("gymdata")
                    // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                }
            })

            if (response.ok) {
                const json = await response.json();

                if (json.Data) {
                    if (json.Data.length === 0) {
                        setPendingData(1);
                    }
                    else {
                        setPendingData(json.Data);
                    }
                }

                else {
                    console.log(json.Error);
                    setPendingData([]);//Reset state when 'pending data' is missing
                }
            }
            else {
                if (response.status === 400) {
                    alert("Expired token. Please log in again.")
                    setPendingData(0);
                    localStorage.removeItem("gymdata")
                }
                else {
                    console.log(`Error fetching pending data: ${response.status} ${response.statusText}`)
                    setPendingData([]);
                }
            }


        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the pending data:", error);
            setPendingData([]);   // Optional: Reset state in case of network error
        }
    }


    // Get fees pending data
    const fetchMembershipStatusUserData = async () => {

        try {
            const response = await fetch(`${host}/user/admin/feesdeadline`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth_token": localStorage.getItem("gymdata")
                    // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                }
            })

            if (response.ok) {
                const json = await response.json();

                // console.log(json);

                if (json.Data) {
                    if (json.Data.length === 0) {
                        setMembershipData(1);
                    }
                    else {
                        setMembershipData(json.Data);
                    }
                }

                else {
                    // console.log(json.Error);
                    setMembershipData([]);//Reset state when 'memberShip data' is missing
                }
            }
            else {
                if (response.status === 400) {
                    alert("Expired token. Please log in again.")
                    setMembershipData(0);
                    localStorage.removeItem("gymdata")
                }
                else {
                    console.log(`Error fetching memberShip data: ${response.status} ${response.statusText}`)
                    setMembershipData([]);
                }
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the memberShip data:", error);
            setMembershipData([]);  // Optional: Reset state in case of network error
        }
    }

    // Get fees pending data
    const fetchHomeAdminData = async () => {

        try {
            const response = await fetch(`${host}/user/admin/homedata`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth_token": localStorage.getItem("gymdata")
                    // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                }
            })

            if (response.ok) {
                const json = await response.json();

                // console.log(json);

                if (json.Data) {
                    if (json.Data.length === 0) {
                        setHomeAdminData(1);
                    }
                    else {
                        setHomeAdminData(json.Data);
                    }
                }

                else {
                    console.log(json.Error);
                    setHomeAdminData([]);//Reset state when 'home data' is missing
                }
            }
            else {
                if (response.status === 400) {
                    alert("Expired token. Please log in again.")
                    setHomeAdminData(0);
                    localStorage.removeItem("gymdata")
                }
                else {
                    console.log(`Error fetching home data: ${response.status} ${response.statusText}`)
                    setHomeAdminData([]);
                }
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the home data:", error);
            setHomeAdminData([]);  // Optional: Reset state in case of network error
        }
    }

    // Get search user data
    const fetchSearchUser = async (search) => {

        try {
            const response = await fetch(`${host}/user/admin/search/?name=${search}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth_token": localStorage.getItem("gymdata")
                    // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                }
            })

            if (response.ok) {
                const json = await response.json();

                // console.log(json);

                if (json.Data) {
                    if (json.Data.length === 18) {
                        setSearchUser(1);
                    }
                    else {
                        setSearchUser(json.Data);
                    }
                    // console.log(json.Data);
                }

                // else {
                //     console.log(json.Error);
                //     setSearchUser([]);//Reset state when 'search user' is missing
                // }
            }
            else {
                if (response.status === 400) {
                    alert("Expired token. Please log in again.")
                    setSearchUser(0);
                    localStorage.removeItem("gymdata")
                }
                else {
                    console.log(`Error fetching search user: ${response.status} ${response.statusText}`)
                    setSearchUser([]);
                }
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the search user:", error);
            setSearchUser([]);   // Optional: Reset state in case of network error
        }
    }


    // Get search user data
    const aceeptMemberRequest = async (id, amount, pStatus) => {

        const acceptFeesArray = pendingData.filter((ids) => ids[4] !== id);

        setPendingData(acceptFeesArray);
        if (acceptFeesArray.length === 0) {
            setPendingData(1);
        }

        try {
            const response = await fetch(`${host}/user/admin/feesaccept/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "auth_token": localStorage.getItem("gymdata")
                    // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                },
                body: JSON.stringify({ amount })
            })

            if (response.ok) {
                const json = await response.json();

                if (json.Data) {
                    alert(json.Data);
                }

                else {
                    console.log(json.Error);
                }
            }
            else {
                if (response.status === 400) {
                    alert("Expired token. Please log in again.")
                    localStorage.removeItem("gymdata")
                    setPendingData(0)
                }
                else {
                    console.log(`Error fetching accept member request: ${response.status} ${response.statusText}`)
                }
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the accept member request:", error);

        }
    }


    // Delete user data from the member request.
    const deleteMemberRequest = async (id) => {

        const acceptFeesArray = pendingData.filter((ids) => ids[4] !== id);
        // console.log(acceptFeesArray);

        setPendingData(acceptFeesArray);
        if (acceptFeesArray.length === 0) {
            setPendingData(1);
        }

        try {
            const response = await fetch(`${host}/user/admin/deletedata/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth_token": localStorage.getItem("gymdata")
                    // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                }
            })

            if (response.ok) {
                const json = await response.json();

                // console.log(json);

                if (json.Data) {
                    alert("Deleted successfully!");
                    // setSearchUser(json.Data);
                    // console.log(json.Data);
                }

                else {
                    console.log(json.Error);
                    // setSearchUser([]);//Reset state when 'delete member request' is missing
                }
            }
            else {
                if (response.status === 400) {
                    alert("Expired token. Please log in again.")
                    localStorage.removeItem("gymdata")
                    setPendingData(0)
                }
                else {
                    console.log(`Error fetching delete member request: ${response.status} ${response.statusText}`)
                }
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the delete member request:", error);
        }
    }


    // Fetch subscription end data
    const fetchSubscriptionEndUserData = async () => {

        try {
            const response = await fetch(`${host}/user/admin/feesend`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth_token": localStorage.getItem("gymdata")
                    // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                }
            })

            if (response.ok) {
                const json = await response.json();

                // console.log(json);

                if (json.Data) {
                    if (json.Data.length === 0) {
                        setSubscriptionEnd(1);
                    }
                    else {
                        setSubscriptionEnd(json.Data);
                    }
                    // console.log(json.Data);
                }
                else {
                    console.log(json.Error);
                    setMonthwiseData([]);//Reset state when 'memberShip data' is missing
                }

            }
            else {
                if (response.status === 400) {
                    alert("Expired token. Please log in again.")
                    setSubscriptionEnd(0);
                    localStorage.removeItem("gymdata")
                }
                else {
                    console.log(`Error fetching fetch subscription data: ${response.status} ${response.statusText}`)
                    setSubscriptionEnd([]);
                }
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the fetch subscription data:", error);
            setSubscriptionEnd([]);    // Optional: Reset state in case of network error
        }
    }



    // Fetch subscription end data
    const fetchUserImage = async (id) => {

        setImageBase64("")

        try {
            const response = await fetch(`${host}/user/admin/fetchimage/${id}`, {
                method: "GET"
            })

            if (response.ok) {
                const json = await response.json();


                if (json.success) {
                    setImageBase64(json.imageLink); // Update with the key that contains base64 string
                }

                else {
                    console.log(json.Error);
                    setImageBase64("");//Reset state when 'fetch user image' is missing
                }
            }
            else {
                console.log(`Error fetching image: ${response.status} ${response.statusText}`)
                setImageBase64("");
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the image:", error);
            setImageBase64([]);
        }
    }



    // Get fees pending data
    const fetchDataMonthWise = async (monthNumber) => {

        // console.log(monthNumber)

        try {
            const response = await fetch(`${host}/user/admin/fetchmonthwise/${monthNumber}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth_token": localStorage.getItem("gymdata")
                    // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                }
            })

            if (response.ok) {
                const json = await response.json();

                // console.log(json);

                if (json.Data) {
                    if (json.Data.length === 0) {
                        setMonthwiseData(1);
                    }
                    else {
                        setMonthwiseData(json.Data);
                    }
                }

                else {
                    console.log(json.Error);
                    setMonthwiseData([]);//Reset state when 'memberShip data' is missing
                }
            }
            else {
                if (response.status === 400) {
                    alert("Expired token. Please log in again.")
                    setMonthwiseData(0);
                    localStorage.removeItem("gymdata")
                }
                else {
                    console.log(`Error fetching memberShip data: ${response.status} ${response.statusText}`)
                    setMonthwiseData([]);
                }
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the memberShip data:", error);
            setMonthwiseData([]);  // Optional: Reset state in case of network error
        }
    }





    // Get fees pending data
    const fetchDaysForSubscriptionEnd = async () => {

        try {
            const response = await fetch(`${host}/user/admin/fetchdays`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth_token": localStorage.getItem("gymdata")
                    // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                }
            })

            if (response.ok) {
                const json = await response.json();

                // console.log(json);

                if (json.Data) {
                    setFetchDays(json.Data);
                }

                else {
                    console.log(json.Error);
                    setFetchDays("0");//Reset state when 'memberShip data' is missing
                }
            }
            else {
                console.log(`Error fetching memberShip data: ${response.status} ${response.statusText}`)
                setFetchDays("0");
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the memberShip data:", error);
            setFetchDays("0");  // Optional: Reset state in case of network error
        }
    }



    // Count Web Visit
    const countWebVisit = async () => {

        try {
            const response = await fetch(`${host}/user/admin/visitdata`, {
                // const response = await fetch(`https://navyug-gym-testing.vercel.app/user/admin/visitdata`, {
                method: "PUT",
                // headers: {
                //     "Content-Type": "application/json",
                //     // "auth_token": localStorage.getItem("gymdata")
                //     // "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODEwNDEzMDE3NiJ9LCJpYXQiOjE3MzA5MDM0MjN9.Af9xlNcXZfd7k2Ycdao3M8FoEnfKcv3plTHwCV_jPgI"
                // }
            })

            if (response.ok) {
                await response.json();

            }
            else {
                console.log(`Error fetching memberShip data: ${response.status} ${response.statusText}`)
            }

        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the memberShip data:", error);
        }
    }




    return (
        <GymContext.Provider value={{ pendingData, setPendingData, fetchFeesPendingData, membershipData, setMembershipData, fetchMembershipStatusUserData, homeAdminData, setHomeAdminData, fetchHomeAdminData, searchUser, setSearchUser, fetchSearchUser, aceeptMemberRequest, deleteMemberRequest, subscriptionEnd, setSubscriptionEnd, fetchSubscriptionEndUserData, imageBase64, fetchUserImage, monthwiseData, setMonthwiseData, fetchDataMonthWise, fetchDays, fetchDaysForSubscriptionEnd, countWebVisit }}>
            {props.children}
        </GymContext.Provider>
    )
}

export default GymState
