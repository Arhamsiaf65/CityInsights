import React, { createContext, useContext, useEffect, useState } from "react";

export const AdContext = createContext();

const baseUrl = import.meta.env.VITE_BASE_URL;

export const AdProvider = ({ children }) => {
    const [ad, setAds] = useState([]);
   
    const fetchAds = async () => {
        try {
            const res = await fetch(`${baseUrl}/add`);
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            const data = await res.json();
            console.log("data of adds", data);
            setAds(data);
        } catch (err) {
            console.log("error fetching ads", err.message);
        } 
    };

    useEffect(() => {
        fetchAds();
    }, [])

    // Fetch all ads
   
    return (
        <AdContext.Provider
            value={{
                ad
            }}
        >
            {children}
        </AdContext.Provider>
    );
};

// Optional: custom hook
