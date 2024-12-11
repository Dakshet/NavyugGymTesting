import React from 'react'
import "./Footer.css"
import logo1 from '../Images/logo1.jpg'
import gymLogo from '../Images/gymlogo1.png'

const Footer = () => {
    return (
        <div className='footer'>
            <div className="footerPanel">
                <div className="footerPanelLeft">
                    <div>
                        <h3>Mahesh Wagh</h3>
                        <h6>(President)</h6>
                        <p>+91 8291616435</p>
                    </div>
                    <div>
                        <h3>Suresh Tambe</h3>
                        <h6>(Vice-President)</h6>
                        <p>+91 9870216612</p>
                    </div>
                    <div>
                        <h3>Santosh Mahaprolkar </h3>
                        <h6>(Supervisor)</h6>
                        <p>+91 9969087553</p>
                    </div>
                </div>
                <div className="footerPanelRight">
                    <div className="footerLogo">
                        <img src={logo1} alt="" />
                        {/* <h2>Navyug Gym</h2> */}
                        <img src={gymLogo} id='footerGymlogo' alt="" />
                    </div>
                    <h6><i className="ri-mail-fill"></i>navyuggym2025@gmail.com</h6>
                    <p><i className="ri-map-pin-2-fill"></i>J J Hospital Compound, Byculla, <span>Mumbai-400008</span></p>
                </div>
            </div>
        </div>
    )
}

export default Footer
