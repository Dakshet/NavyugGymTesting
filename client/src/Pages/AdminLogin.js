import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "./AdminLogin.css"

const AdminLogin = () => {

    const navigate = useNavigate();

    const host = process.env.REACT_APP_HOST_NAME;

    const [mobileNo, setMobileNo] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // State to handle loading animation



    const handleAdminLogin = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true); // Show loader when the request starts

        try {
            const response = await fetch(`${host}/user/login/admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ mobileNo, password })
            })

            setLoading(false); // Hide loader after response is received

            if (response.ok) {
                const json = await response.json();


                if (json.success) {
                    // showAlert("Successfully Login!", "success");
                    localStorage.setItem('gymdata', json.token)   //token save in local storage.
                    navigate("/admin/home")
                }
                else {
                    alert(json.Error);
                    navigate("/admin");
                }

            }
            else {
                if (response.status === 400) {
                    alert("Incorrect User Number or Password. Please try again.");
                }
                else {
                    console.log(`Error fetching memberShip data: ${response.status} ${response.statusText}`)
                }
            }
        } catch (error) {
            console.error("Error", error.message);
        }

    }, [mobileNo, password, navigate, host])


    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - Admin login";  // Set the document title to the news title
    }, []);


    return (
        <>
            {
                loading ? (
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
                ) : (
                    <div className='admin'>
                        <div className="adminForm">
                            <form action="" onSubmit={handleAdminLogin}>
                                <label htmlFor="mobileNo">Mobile Number</label>
                                <input type="tel" name='mobileNo' id='mobileNo' value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} />
                                <label htmlFor="password">Password</label>
                                <input type="password" name='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button className='formBtn' type="submit" >Login</button>
                            </form>
                        </div>
                    </div>
                )}
        </>
    )
}

export default AdminLogin
