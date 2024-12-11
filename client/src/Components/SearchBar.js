import React, { useCallback, useContext, useState } from 'react'
import "./SearchBar.css"
import GymContext from '../context/Gym/GymContext'
import { useNavigate } from 'react-router-dom'

const SearchBar = ({ showSearch, setShowSearch }) => {

    const navigate = useNavigate();

    const [name, setName] = useState("")

    const { fetchSearchUser } = useContext(GymContext);

    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault();
        setShowSearch(false);
        fetchSearchUser(name);
        navigate("/admin/search/result")
    }, [name, setShowSearch, fetchSearchUser, navigate]);


    return (
        <div className={`${showSearch ? "searchBar" : "hideSearchBar"}`}>
            <div className="searchBarInner">
                <form action="" onSubmit={handleSearchSubmit}>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Search name, surname, mobile number' />
                    <i className="ri-search-line" onClick={handleSearchSubmit}></i>
                </form>
            </div>
        </div>
    )
}

export default SearchBar
