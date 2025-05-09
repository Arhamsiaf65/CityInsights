import { useState, useEffect, useRef, useContext } from "react";
import { CategoriesContext } from "../context/categoriesContext";
import { useNavigate } from "react-router-dom";

export default function CategoryBar() {
  const { categories } = useContext(CategoriesContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Duplicate categories to simulate infinite scroll
  const repeatedCategories = [...categories, ...categories, ...categories];

  // Set scroll to the middle
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollLeft = scrollContainer.scrollWidth / 3;
    }
  }, [categories]);

  // Auto-scroll
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const speed = 0.5; // scroll speed in pixels per tick

    const scroll = () => {
      if (!scrollContainer) return;
      scrollContainer.scrollLeft += speed;

      const maxScroll = scrollContainer.scrollWidth;
      const oneThird = maxScroll / 3;

      // Reset to middle loop point
      if (scrollContainer.scrollLeft >= oneThird * 2) {
        scrollContainer.scrollLeft = oneThird;
      }
    };

    const interval = setInterval(scroll, 20); // smoother experience

    return () => clearInterval(interval);
  }, [categories]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate(`/category/${category.name}`);
  };

  return (
    <div className="sticky top-0 z-30 bg-white shadow-inner border-t border-gray-200 px-2">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto whitespace-nowrap scroll-smooth py-2 no-scrollbar"
        style={{ scrollbarWidth: "none" }} // For Firefox
      >
        {repeatedCategories.map((cat, idx) => (
          <button
            key={`${cat._id}-${idx}`}
            onClick={() => handleCategorySelect(cat)}
            className={`mx-2 px-4 py-1.5 rounded-full text-sm border border-gray-300 text-gray-700 hover:bg-blue-50 transition-all ${
              selectedCategory?._id === cat._id
                ? "bg-blue-100 text-blue-800 font-semibold border-blue-300"
                : ""
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Tailwind-compatible custom scrollbar hiding */}
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
}
