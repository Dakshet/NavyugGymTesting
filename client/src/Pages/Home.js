import React, { useCallback, useEffect, useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "./Home.css"
import ConditionsModal from '../Components/ConditionsModal';
import GymContext from '../context/Gym/GymContext';

const Home = () => {
    const navigate = useNavigate();
    const host = process.env.REACT_APP_HOST_NAME;

    const { countWebVisit } = useContext(GymContext);

    const [uPhoto, setUPhoto] = useState("");
    const [fName, setFName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [address, setAddress] = useState("");
    const [dOB, setDOB] = useState("");
    const [age, setAge] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [workoutTime, setWorkoutTime] = useState("");
    const [customBloodGroup, setCustomBloodGroup] = useState("");
    const [conditionModal, setConditionModal] = useState("");
    const [loading, setLoading] = useState(false);

    const imageUploadRef = useRef(null);

    const handleUploadImage = () => {
        imageUploadRef.current.click();
    }


    // const uploadImage = useCallback((event) => {
    //     const validImageTypes = ["image/jpeg", "image/jpg"];

    //     try {
    //         if (validImageTypes.includes(event.target.files[0].type)) {
    //             setUPhoto(event.target.files[0])
    //         }
    //         else {
    //             alert("Enter image in correct format!");
    //         }

    //     } catch (error) {
    //         console.log("Error", error)
    //     }
    // }, [])

    const uploadImage = useCallback((event) => {
        const validImageTypes = ["image/jpeg", "image/jpg"];
        const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes

        try {
            const file = event.target.files[0];

            if (!file) return; // No file selected

            if (!validImageTypes.includes(file.type)) {
                alert("Please upload an image in JPG or JPEG format.");
                return;
            }

            if (file.size > maxFileSize) {
                alert("File size should not exceed 5 MB.");
                return;
            }

            setUPhoto(file); // Accept the image
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }, []);



    const handleMobileNoChange = useCallback((e) => {

        let value = e.target.value;

        // Remove all spaces
        value = value.replace(/\s+/g, '');

        // Remove the +91 prefix if present
        if (value.startsWith('+91')) {
            value = value.slice(3);
        }

        // Ensure only the last 10 digits are kept (to handle invalid extra digits)
        value = value.slice(-10);

        setMobileNo(value);
    }, []);



    const handleSubmitForm = useCallback(async (e) => {
        e.preventDefault();

        setLoading(true);

        const finalBloodGroup = bloodGroup === "other" ? customBloodGroup : bloodGroup;

        const formData = new FormData();

        formData.append("uPhoto", uPhoto)
        formData.append("fName", fName)
        formData.append("email", email)
        formData.append("mobileNo", mobileNo)
        formData.append("address", address)
        formData.append("dOB", dOB)
        formData.append("age", age)
        formData.append("bloodGroup", finalBloodGroup)
        formData.append("workoutTime", workoutTime)

        try {
            const response = await fetch(`${host}/user/signup`, {
                method: "POST",
                body: (formData)
            })

            setLoading(false);

            const json = await response.json();

            if (json.success) {
                navigate("/user/home");
            }

            else {
                setUPhoto("")
                alert(json.Error);
            }


        } catch (error) {
            // Catch any network or unexpected errors
            console.error("Error fetching the news:", error);
        }


    }, [uPhoto, fName, email, mobileNo, address, dOB, age, bloodGroup, workoutTime, customBloodGroup, navigate, host]);


    // Counter Call
    useEffect(() => {
        countWebVisit()
        // eslint-disable-next-line
    }, [])


    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - Login Form";  // Set the document title to the news title
    }, []);

    return (
        <>
            {loading ? (
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
                </div >) : (
                <>

                    <div className='hero'>
                        <div className="heroForm">
                            <form action="" onSubmit={handleSubmitForm}>
                                <div className="uploadImage" onClick={handleUploadImage}>
                                    {uPhoto ? <img src={URL.createObjectURL(uPhoto)} alt="" /> : (
                                        <p>Upload your image</p>
                                    )}
                                    <input type="file" name='uPhoto' ref={imageUploadRef} accept="image/jpeg" id='uPhoto' onChange={uploadImage} required />
                                </div>
                                <label htmlFor="fName">Full Name</label>
                                <input type="text" name='fName' id='fName' value={fName} onChange={(e) => setFName(e.target.value)} required />
                                <label htmlFor="email">Email</label>
                                <input type="email" name='email' id='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter your correct Email Id' />
                                <label htmlFor="mobileNo">Mobile Number</label>
                                <input type="tel" name='mobileNo' id='mobileNo' value={mobileNo} onChange={handleMobileNoChange} placeholder="No spaces or +91" required minLength={10} />
                                <label htmlFor="address">Address</label>
                                <textarea name="address" id="address" rows="4" value={address} onChange={(e) => setAddress(e.target.value)} ></textarea>
                                <div className='adjustWidth'>
                                    <div>
                                        <label htmlFor="dOB">Date Of Birth</label>
                                        <input type="date" name='dOB' id='dOB' value={dOB} onChange={(e) => setDOB(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label htmlFor="age">AGE</label>
                                        <input type="text" name='age' id='age' value={age} onChange={(e) => setAge(e.target.value)} required />
                                    </div>
                                </div>
                                <div className='adjustWidth'>
                                    <div>
                                        <label htmlFor="bloodGroup">Blood Group</label>
                                        <select name="bloodGroup" id="bloodGroup" required onChange={(e) => setBloodGroup(e.target.value)}>
                                            <option value="">Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {bloodGroup === "other" ? <input type="text" value={customBloodGroup} placeholder='Enter your blood group' onChange={(e) => setCustomBloodGroup(e.target.value)} required /> : ""}
                                    </div>
                                    <div>
                                        <label htmlFor="workoutTime">Workout Time</label>
                                        <select name="workoutTime" id="workoutTime" value={workoutTime} required onChange={(e) => setWorkoutTime(e.target.value)}>
                                            <option value="">Select Time</option>
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='checkBoxDiv'>
                                    <input type="checkbox" id="readData" name="readData" required />
                                    <label>I have read and agree to the terms of the <span onClick={() => setConditionModal(true)}>Navyug Gym.</span></label>
                                </div>
                                <button className='formBtn' type="submit" >Submit</button>
                            </form>
                        </div>
                    </div>
                    <ConditionsModal conditionModal={conditionModal} setConditionModal={setConditionModal} />
                </>)
            }
        </>
    )
}

export default Home
