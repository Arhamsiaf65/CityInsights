import { createContext, useState, useEffect } from "react";

// Create the context
export const CategoriesContext = createContext();

// Create the provider component
export function CategoriesProvider({ children }) {
  const [categories, setcategories] = useState([]);

  useEffect(() => {
    const fetchcategories = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const response = await fetch(`${baseUrl}/categories`);
        const data = await response.json();
        setcategories(data.categories);
      } catch (error) {
        console.error("Failed to fetch categorys:", error);
      }
    };

    fetchcategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, setcategories }}>
      {children}
    </CategoriesContext.Provider>
  );
}