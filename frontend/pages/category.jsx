import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PostsContext } from '../context/postContext';
import { CategoriesContext } from '../context/categoriesContext';
import PostCard from '../components/postCard';
import { FaFilter, FaArrowLeft } from 'react-icons/fa';

function Category() {
  const { categorySlug } = useParams();
  const {
    posts,
    popularPosts,
    fetchCategoryPosts,
    categoryPosts,
    loadingCategoryPost,
    isLoading: postsLoading,
    fetchPosts,
    fetchInitialPopularPosts
  } = useContext(PostsContext);
  const { categories, isLoading: categoriesLoading } = useContext(CategoriesContext);
  const [sortOption, setSortOption] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  // let newPosts = [...posts, popularPosts]
  console.log("category slug", categorySlug);
  console.log("Category posts", categoryPosts);
  // Safely get category after categories are loaded
  const category = !categoriesLoading
  && categories.length > 0 ? categories.find((cat) =>
      cat.name?.toLowerCase() === categorySlug?.toLowerCase()
    )
  : null;


  // Fetch posts when categorySlug changes
  useEffect(() => {
    fetchCategoryPosts(categorySlug);
  }, [categorySlug]);

  // Handle loading state or missing category
  if (postsLoading || categoriesLoading || !category) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
      </div>
    );  
  }

  // Apply filters and sorting
  const filteredPosts = categoryPosts.length > 0 && categoryPosts
  .filter((post) => post.category && post.category.name?.toLowerCase() === categorySlug.toLowerCase())
    .filter((post) => (showFeaturedOnly ? post.featured : true))
    .sort((a, b) => {
      if (sortOption === 'mostLiked') return b.likes - a.likes;
      if (sortOption === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* Filter Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-6">
        {/* Sort Options */}
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Sort By</h2>
          <div className="flex flex-wrap gap-3">
            {['mostLiked', 'newest', 'oldest'].map((option) => (
              <button
                key={option}
                onClick={() => setSortOption(option)}
                className={`px-4 cursor-pointer py-2 rounded-full text-sm font-medium transition-all shadow ${
                  sortOption === option
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option === 'mostLiked' ? 'Most Liked' : option === 'newest' ? 'Newest' : 'Oldest'}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Only Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFeaturedOnly((prev) => !prev)}
            className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg shadow transition-all ${
              showFeaturedOnly
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
          >
            <FaFilter />
            <span>Featured Only</span>
          </button>
        </div>
      </div>

      {/* Category Title */}
      <div className="mb-8 text-center relative">
        <h1 className="text-5xl font-bold text-gray-800 capitalize">
          {category.name}
        </h1>
        <div className="w-24 h-1 bg-blue-700 mx-auto mt-2 rounded" />
        <Link
          to="/"
          className="absolute top-2 left-2 sm:top-4 sm:left-4 text-xl sm:text-2xl text-gray-600 hover:text-blue-700 transition"
          title="Go Back"
        >
          <FaArrowLeft />
        </Link>
      </div>

      {/* Posts Grid */}
      {loadingCategoryPost ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6).fill(0).map((_, idx) => (
      <div
        key={idx}
        className="animate-pulse bg-white rounded-lg shadow p-4 space-y-4"
      >
        <div className="h-40 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
    ))}
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredPosts.length > 0 ? (
      filteredPosts.map((post) => (
        <PostCard
          key={post._id}
          id={post._id}
          image={post.images?.[0]}
          author={post.author}
          title={post.title}
          likes={post.likes}
          description={post.content.slice(0, 100) + '...'}
          link={`/post/${post._id}`}
          details={[post.content]}
        />
      ))
    ) : (
      <div className="col-span-full text-center text-gray-400 text-xl py-20">
        No posts found in this category.
      </div>
    )}
  </div>
)}

    </div>
  );
}

export default Category;
