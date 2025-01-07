import React, { useCallback, useEffect, useState } from 'react'
import "./Navbar.css"
import logo from '../Images/logo1.jpg'
import gymLogo from '../Images/gymlogo1.png'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'

const Navbar = () => {

    // const { homeAdminData } = useContext(GymContext);

    const navigate = useNavigate();

    const location = useLocation();

    const [showSearch, setShowSearch] = useState("");

    const [showSideBar, setShowSideBar] = useState(false);

    const [showButtons, setShowButtons] = useState(false);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("gymdata")
        // setShowButtons(false);
        navigate('/admin')
    }, [navigate])


    useEffect(() => {
        if (location.pathname === "/admin") {
            setShowButtons(false);
        }
    }, [location])


    useEffect(() => {
        if (localStorage.getItem("gymdata")) {
            setShowButtons(true);
        }
    }, [navigate])

    return (
        <div className='navbar'>
            <Link to="/">
                <div className="navbarLogo">
                    <img src={logo} alt="" />
                    {/* <h2>Navyug Gym</h2> */}
                    <img src={gymLogo} id='gymlogo' alt="" />
                </div>
            </Link>
            <div className={`${showSideBar ? "navbarMobileButtonx" : "navbarMobileButton"}`} onClick={() => setShowSideBar(false)}>
                <div className='navbarButtons'>
                    {/* <Link onClick={() => setShowSearch(!showSearch)} className={`${location.pathname === "/" ? "hideBtn" : ""}`}>
                        <i className="ri-search-line hideMobileMenu"></i>
                    </Link> */}
                    <Link onClick={() => setShowSearch(!showSearch)} className={`${showButtons ? "" : "hideBtn"}`}>
                        <i className="ri-search-line hideMobileMenu"></i>
                    </Link>
                    {/* <Link to="/admin/home" className={`${location.pathname === "/" ? "hideBtn" : ""}`}>
                        <button>Home</button>
                    </Link> */}
                    <Link to="/admin/home" className={`${showButtons ? "" : "hideBtn"}`}>
                        <button>Home</button>
                    </Link>
                    <Link to="/admin/add/panel" className={`${showButtons ? "" : "hideBtn"}`}>
                        <button>Membership Requests</button>
                    </Link>
                    <Link to="/admin/membership/data" className={`${showButtons ? "" : "hideBtn"}`}>
                        <button>Members Data</button>
                    </Link>
                    <Link to="/admin/membership/panel" className={`${showButtons ? "" : "hideBtn"}`}>
                        <button>Membership Status</button>
                    </Link>
                    <Link to="/admin/membership/end" className={`${showButtons ? "" : "hideBtn"}`}>
                        <button>Subscription End</button>
                    </Link>
                    {showButtons ? <button onClick={handleLogout}>Logout</button> :
                        <Link to="/admin" className={`${location.pathname === "/admin" ? "hideBtn" : ""}`}>
                            {/* // <Link to="/admin" className={`${location.pathname === "/admin" ? "hideBtn" : "hideBtn"}`}> */}
                            <button>Admin</button>
                        </Link>}
                </div>
            </div>
            <div className="mobileMenuIcon">
                <Link onClick={() => setShowSearch(!showSearch)} className={`${showButtons ? "" : "hideBtn"}`}>
                    {/* <Link onClick={() => setShowSearch(!showSearch)} className={`${showButtons ? "hideBtn" : "hideBtn"}`}> */}
                    <i className="ri-search-line mobileSearchBar"></i>
                </Link>
                {/* <i onClick={() => setShowSideBar(!showSideBar)} className="ri-menu-line mobileMenuBar"></i> */}
                {/* <i onClick={() => setShowSideBar(true)} className={`ri-menu-line mobileMenuBar ${showSideBar ? "hideBtn" : "hideBtn"}`}></i> */}
                <i onClick={() => setShowSideBar(true)} className={`ri-menu-line mobileMenuBar ${showSideBar ? "hideBtn" : ""}`}></i>
                {/* <i onClick={() => setShowSideBar(false)} className={`ri-close-line mobileMenuBar ${showSideBar ? "hideBtn" : "hideBtn"}`}></i> */}
                <i onClick={() => setShowSideBar(false)} className={`ri-close-line mobileMenuBar ${showSideBar ? "" : "hideBtn"}`}></i>
            </div>

            <SearchBar showSearch={showSearch} setShowSearch={setShowSearch} />

        </div >
    )
}

export default Navbar
