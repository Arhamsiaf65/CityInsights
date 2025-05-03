import React, { useContext, useState, useEffect, useRef } from "react";
import Navbar from "../components/navBar";
import { Search } from "lucide-react";
import PostCard from "../components/postCard";
import { PostsContext } from "../context/postContext";
import { CategoriesContext } from "../context/categoriesContext";
import { FaCheck, FaFilter } from "react-icons/fa";
import { FiXCircle } from "react-icons/fi";

function Home() {
  const { posts,fetchPosts } = useContext(PostsContext);
  const { categories } = useContext(CategoriesContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(()=> {
    fetchPosts()
  })

  const filterSidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterSidebarRef.current && !filterSidebarRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryName)
        ? prevSelected.filter((cat) => cat !== categoryName)
        : [...prevSelected, categoryName]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSortOption("");
    setShowFeaturedOnly(false);
  };

  const filteredPosts = posts
    .filter((post) => {
      if (searchTerm.trim() === "") return true;
      const lowerSearch = searchTerm.toLowerCase();
      return (
        post.title.toLowerCase().includes(lowerSearch) ||
        post.content.toLowerCase().includes(lowerSearch) ||
        post.author.name.toLowerCase().includes(lowerSearch)
      );
    })
    .filter((post) => {
      if (selectedCategories.length === 0) return true;
      return selectedCategories.includes(post.category.name);
    })
    .filter((post) => (showFeaturedOnly ? post.featured : true))
    .sort((a, b) => {
      if (sortOption === "mostLiked") return b.likes - a.likes;
      if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* Mobile Top Bar */}
      <div className="flex justify-between items-center mb-6 lg:hidden">
        <h2 className="text-2xl font-bold text-gray-800">Explore Posts</h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFilterOpen(!isFilterOpen);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow ${selectedCategories.length > 0 || sortOption || showFeaturedOnly
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-blue-600"
            } hover:bg-blue-700 transition`}
        >
          <FaFilter />
          <span className="text-sm font-semibold">Filters</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div
  ref={filterSidebarRef}
  className={`bg-white p-5 rounded-2xl shadow-lg z-30 w-60 overflow-y-auto
  lg:w-full lg:sticky lg:top-24 lg:h-fit 
  ${isFilterOpen ? "fixed top-16 left-0 h-[calc(100%-4rem)] transform translate-x-0 transition duration-300 ease-in-out" : "fixed top-16 left-[-100%] h-[calc(100%-4rem)] transform transition duration-300 ease-in-out"}
  ${isFilterOpen ? "lg:relative lg:translate-x-0" : "lg:relative lg:translate-x-0"}
`}  
>


          {/* Filters Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold"
            >
              <FaFilter size={14} /> Clear
            </button>
          </div>

          {/* Active Filters Tags */}
          {(selectedCategories.length > 0 || sortOption || showFeaturedOnly) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryToggle(cat)}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs hover:bg-blue-200"
                >
                  {cat} <FiXCircle size={12} />
                </button>
              ))}
              {sortOption && (
                <button
                  onClick={() => setSortOption("")}
                  className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs hover:bg-green-200"
                >
                  {sortOption === "mostLiked" ? "Most Liked" : sortOption === "newest" ? "Newest" : "Oldest"}
                  <FiXCircle size={12} />
                </button>
              )}
              {showFeaturedOnly && (
                <button
                  onClick={() => setShowFeaturedOnly(false)}
                  className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs hover:bg-yellow-200"
                >
                  Featured <FiXCircle size={12} />
                </button>
              )}
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryToggle(cat.name)}
                  className={`px-4 py-2 rounded-full border text-xs font-medium transition-all ${selectedCategories.includes(cat.name)
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Only Toggle */}
          <div className="mt-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={() => setShowFeaturedOnly((prev) => !prev)}
              />
              Show Featured Posts Only
            </label>
          </div>

          {/* Sort Options */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Sort By</h3>
            <div className="flex flex-col gap-3">
              {[
                { value: "mostLiked", label: "Most Liked" },
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-between p-2 rounded-xl border bg-white/70 backdrop-blur-md shadow cursor-pointer transition ${sortOption === option.value
                      ? "border-blue-500 shadow-lg scale-[1.01]"
                      : "border-gray-300 hover:border-blue-400 hover:shadow-md"
                    }`}
                >
                  <span className="text-xs font-medium text-gray-900">{option.label}</span>
                  <div className="relative">
                    <div className="h-2 w-2 border rounded-full p-3 flex items-center justify-center">
                      {sortOption === option.value && <FaCheck className="text-green-500" />}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="sortOption"
                    value={option.value}
                    checked={sortOption === option.value}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className=" lg:col-span-3 px-2 bg-white rounded-2xl sm:px-6">
          <div className="sticky top-18 z-20 bg-white py-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-start relative drop-shadow-md ">
              TOP INSIGHTS
              <span className="block w-24 sm:w-82 h-[2px] bg-blue-900 mt-3 rounded-full shadow-sm"></span>
            </h1>


            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="bg-gray-100 text-gray-800 pl-10 pr-4 py-2 rounded-lg w-full h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          {/* Posts Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post._id} className="mb-4 break-inside-avoid">
                  <PostCard
                    id={post._id}
                    image={post.images?.[0]}
                    author={post.author}
                    title={post.title}
                    likes={post.likes}
                    description={post.content.slice(0, 100) + "..."}
                    link={`/post/${post._id}`}
                    details={[post.content]}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-2xl py-20 col-span-full">
                No posts found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
