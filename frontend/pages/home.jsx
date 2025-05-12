import React, { useContext, useState, useEffect, useRef } from "react";
import Navbar from "../components/navBar";
import { Search } from "lucide-react";
import PostCard from "../components/postCard";
import { PostsContext } from "../context/postContext";
import { userContext } from "../context/userContext";
import { CategoriesContext } from "../context/categoriesContext";
import { FaCheck, FaCross, FaFilter, FaCog } from "react-icons/fa";
import { FiXCircle } from "react-icons/fi";
import ScrollToTop from "../components/scrollToTop";
import { AdContext } from "../context/addContext";

function Home() {
  const { posts, fetchPosts, isLoading, popularPosts, loadingMore, searchPosts, hasMore} = useContext(PostsContext);
  const { isLogin } = useContext(userContext);
  const { categories } = useContext(CategoriesContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const { ad } = useContext(AdContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {

      searchPosts(searchTerm);

    }, 500); // debounce to avoid spamming search

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const filterSidebarRef = useRef(null);




  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryName)
        ? prevSelected.filter((cat) => cat !== categoryName)
        : [...prevSelected, categoryName]
    );
    window.scrollTo({ top: 0, behavior: "smooth" }); // ✅
  };


  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSortOption("");
    setShowFeaturedOnly(false);
  };

  const filteredPosts = popularPosts
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
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 relative">
      {/* Sidebar Toggle Button (Desktop Left Icon) */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className={`hidden lg:flex fixed  left-2 z-50 transform -translate-y-1/2 
    bg-blue-600 text-white p-3 rounded-full shadow transition-transform duration-300 
  animate-spin ${isFilterOpen ? "top-[0.8]" : "top-1/2"}`}
      >
        <FaCog size={20} />
      </button>

      {/* Mobile Top Bar */}
      <div className="flex justify-between items-center mb-6 lg:hidden">
        <h2 className="text-2xl font-bold text-gray-800">Explore Posts</h2>
        <button
          onClick={() => {
            setIsFilterOpen(!isFilterOpen);
            console.log("filter state", isFilterOpen);
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

      {/* Grid Layout */}
      <div className={` ${isFilterOpen ? "grid grid-cols-1 lg:grid-cols-[25%_1fr] gap-8" : " md:grid-cols-4 lg:grid-cols-4"} gap-8`}>
        {/* Sidebar */}
        <div
          ref={filterSidebarRef}
          className={`bg-white p-5 rounded-2xl shadow-lg overflow-y-auto z-10
    w-[75%] md:w-full 
    ${isFilterOpen ? "fixed top-16 left-0 h-[calc(100%-4rem)] w-64 transition-transform duration-300 ease-in-out z-40" : "hidden"}
    md:sticky md:top-20 md:self-start md:h-auto md:z-10`}
        >
          {/* Close Button - Mobile Only */}
          <button
            onClick={() => setIsFilterOpen(false)}
            className="absolute top-6 right-4 text-gray-500 hover:text-black md:hidden"
          >
            <FiXCircle size={20} />
          </button>

          {/* Filters Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>

          </div>
          <button
            onClick={clearAllFilters}
            className="flex items-center mb-3 gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold"
          >
            <FaFilter size={14} /> Clear
          </button>
          {/* Active Filters Tags */}
          {(selectedCategories.length > 0 || sortOption || showFeaturedOnly) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    handleCategoryToggle(cat);
                    setIsFilterOpen(false);
                  }}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs hover:bg-blue-200"
                >
                  {cat} <FiXCircle size={12} />
                </button>
              ))}
              {sortOption && (
                <button
                  onClick={() => {
                    setSortOption("");
                    setIsFilterOpen(false);
                  }}
                  className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs hover:bg-green-200"
                >
                  {sortOption === "mostLiked" ? "Most Liked" : sortOption === "newest" ? "Newest" : "Oldest"}
                  <FiXCircle size={12} />
                </button>
              )}
              {showFeaturedOnly && (
                <button
                  onClick={() => {
                    setShowFeaturedOnly(false);
                    setIsFilterOpen(false);
                  }}
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
                  onClick={() => {
                    handleCategoryToggle(cat.name);
                    setIsFilterOpen(false);
                  }}
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
                onChange={() => {
                  setShowFeaturedOnly((prev) => !prev);
                  setIsFilterOpen(false);
                }}
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
                    onChange={(e) => {
                      setSortOption(e.target.value);
                      setIsFilterOpen(false);
                    }}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>



        {/* Main Content */}
        {/* show here the featured posts only */}
        <div className=" px-2 bg-white rounded-2xl sm:px-6">
          <div className="sticky z-20 bg-white py-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-start relative drop-shadow-md ">
              TRENDING
              <span className="block w-24 sm:w-64 h-[2px] bg-blue-900 mt-3 rounded-full shadow-sm"></span>
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
          <div className={`grid grid-cols-1 ${isFilterOpen ? 'sm:grid-cols-2 md:grid-cols-3' : 'sm:grid-cols-3 md:grid-cols-4'} gap-6`}>

            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="animate-pulse bg-white p-4 rounded-xl shadow-md space-y-4">
                  <div className="h-40 bg-gray-300 rounded-lg" />
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post._id} className="mb-4">
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
              popularPosts.map((post) => (
                <div key={post._id} className="mb-4">
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
            )}

           



          </div>






          {/* Main Content */}
          <div className="lg:col-span-4 px-2 bg-white rounded-2xl sm:px-6">
            <div className="bg-white py-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-start relative drop-shadow-md">
                FOR YOU
                <span className="block w-24 sm:w-58 h-[2px] bg-blue-900 mt-3 rounded-full shadow-sm"></span>
              </h1>
            </div>

            {/* Posts Section */}
            <div
              className={`grid gap-6 ${isFilterOpen
                ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}


            >
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse bg-white p-4 rounded-xl shadow-md space-y-4"
                  >
                    <div className="h-40 bg-gray-300 rounded-lg" />
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))
              ) : posts.length > 0 ? (
                posts.map((post, index) => (
                  <React.Fragment key={post._id}>
                    {/* Insert ad after the 3rd post */}
                    {index === 4 && (
                      <div className="col-span-full">
                        <div className="relative bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border border-yellow-200 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
                          <img
                            src={ad.images}
                            alt="Ad"
                            className="w-[65%] md:w-1/2 h-64 object-cover rounded-xl shadow-md"
                          />
                          <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                              {ad.title}
                            </h2>
                            <p className="text-base text-gray-600 mb-3">
                              {ad.description}
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                              <strong>Location:</strong> {ad.address}
                            </p>
                            {ad.link && (
                              <a
                                href={ad.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition"
                              >
                                Visit Website
                              </a>
                            )}
                            <p className="mt-4 text-xs text-gray-400 italic">
                              Sponsored by Insights
                            </p>
                          </div>
                        </div>
                      </div>

                    )}

                    <div className="break-inside-avoid">
                      <PostCard
                        id={post._id}
                        image={post.images?.[0]}
                        author={post.author}
                        title={post.title}
                        likes={post.likes}
                        description={post.content.slice(0, 100) + '...'}
                        link={`/post/${post._id}`}
                        details={[post.content]}
                      />
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <div className="text-center text-gray-400 text-2xl py-20 col-span-full">
                  No posts found matching your filters.
                </div>
              )}




            </div>


            {loadingMore && (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

{hasMore && !isLoading && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchPosts()}
                  disabled={loadingMore}
                  className={`px-6 py-2 text-white font-semibold rounded-lg shadow-md transition ${loadingMore
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>

        </div>





      </div>


    </div>

  );
}

export default Home;
