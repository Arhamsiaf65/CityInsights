import { createContext, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { ErrorToast, SuccessToast } from "../components/toast";

export const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true); // Initial loading (first fetch)
  const [loadingMore, setLoadingMore] = useState(false); // For pagination spinner
  const [loadingCategoryPost, setLoadingCategoryPost] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const isFetchingRef = useRef(false);
  const loadTriggerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
          fetchPosts(categorySlug, search);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );
  
    if (loadTriggerRef.current) {
      observer.observe(loadTriggerRef.current);
    }
  
    return () => {
      if (loadTriggerRef.current) {
        observer.unobserve(loadTriggerRef.current);
      }
    };
  }, [loadTriggerRef, hasMore]);
  

  const fetchPosts = async (categorySlug, search = "") => {
    const token = Cookies.get("token");

    if (!hasMore || isFetchingRef.current) return;

    const isFirstFetch = posts.length === 0;
    if (isFirstFetch) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    isFetchingRef.current = true;

    try {
      const response = await fetch(
        `${baseUrl}/posts/fetch?skip=${skip}&limit=10&category=${categorySlug}&search=${search}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();

      if (data.length < 10) {
        setHasMore(false);
      }

      setPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map(post => post._id.toString()));
        const newPosts = data.filter(post => !existingPostIds.has(post._id.toString()));
      
        // Exclude any post that is already in popularPosts
        const popularPostIds = new Set(popularPosts.map(post => post._id.toString()));
        const filteredNewPosts = newPosts.filter(post => !popularPostIds.has(post._id.toString()));
      
        return [...prevPosts, ...filteredNewPosts];
      });
      

      setSkip((prevSkip) => prevSkip + 10);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  

 
  



  

  const fetchCategoryPosts = async (categorySlug, search = "") => {
    setLoadingCategoryPost(true);
        try {
      const response = await fetch(
        `${baseUrl}/posts?category=${categorySlug}&search=${search}`
      );
      const data = await response.json();
      setCategoryPosts(data.posts); // Replace current posts
      setLoadingCategoryPost(false)
    } catch (error) {
      console.error("Failed to fetch category posts:", error);
      setLoadingCategoryPost(false);
    }
  };
  
  
  
  // Load posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchInitialPopularPosts = async () => {
    try {
      const response = await fetch(`${baseUrl}/posts/popular`);
      const data = await response.json();
  
      // Filter out posts already in the main posts list
      const postIds = new Set(posts.map(post => post._id.toString()));
      const filteredPopular = data.filter(post => !postIds.has(post._id.toString()));
  
      setPopularPosts(filteredPopular);
    } catch (error) {
      console.error("Failed to fetch popular posts:", error);
    }
  };
  useEffect(() => {
    // Only fetch once at mount
  
    
    fetchInitialPopularPosts();
  }, []);
  

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const isBottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100;
  
      if (isBottom) {
        fetchPosts();
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [skip, hasMore, loading]);

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`${baseUrl}/comments/${postId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  // Like a post
  const likePost = async (postId, userId) => {
    try {
      console.log(postId, userId);
      const token = Cookies.get("token");
      const response = await fetch(`${baseUrl}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, likes: data.totalLikes, isLiked: data.liked }
              : post
          )
        );
      } else {
        const errorData = await response.json();
        toast.custom((t) => (
          <ErrorToast
            t={t}
            title="Error"
            message="Failed to like/unlike post. Login to perform action"
          />
        ), { duration: 400 });
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
      toast.custom((t) => (
        <ErrorToast
          t={t}
          title="Error"
          message="An unexpected error occurred while liking/unliking the post."
        />
      ), { duration: 400 });

      navigate("/login");
    }
  };

  // Share a post
  const sharePost = async (postId) => {
    try {
      const response = await fetch(`${baseUrl}/posts/${postId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
      } else {
        const errorData = await response.json();
        toast.custom(
          (t) => (
            <ErrorToast
              t={t}
              title="Error"
              message="Failed to share the post."
            />
          ),
          { duration: 4000 }
        );
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.custom(
        (t) => (
          <ErrorToast
            t={t}
            title="Error"
            message="An unexpected error occurred while sharing the post."
          />
        ),
        { duration: 4000 }
      );
    }
  };

  // Post a comment
  const postComment = async (postId, content, userId) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`${baseUrl}/comments/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prevComments) => [data.comment, ...(Array.isArray(prevComments) ? prevComments : [])]);
      } else {
        const errorData = await response.json();
        toast.custom(
          (t) => (
            <ErrorToast
              t={t}
              title="Error"
              message="Failed to post the comment."
            />
          ),
          { duration: 4000 }
        );
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.custom(
        (t) => (
          <ErrorToast
            t={t}
            title="Error"
            message="An unexpected error occurred while posting the comment."
          />
        ),
        { duration: 4000 }
      );
    }
  };

  // Search posts based on query
  const searchPosts = async (query) => {
    setSearchTerm(query); // Update search term
    if (query.trim() === "") {
      setPopularPosts([]); // Clear posts when query is empty
      setSkip(0);
      setHasMore(true);
      fetchInitialPopularPosts(); // Fetch all posts again if no search term
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/posts/search?q=${query}`);
      const data = await response.json();
      setPopularPosts(data); // Set the filtered posts
      setSkip(data.length); // Update skip to the number of posts found
      setHasMore(false); // No more posts to fetch for the search
    } catch (error) {
      console.error("Failed to search posts:", error);
    }
  };

  const fetchPostsByCategoryId = async (categoryId) => {
    try {
      const response = await fetch(`/api/category/${categoryId}`);
      const data = await response.json();
      setCategoryPosts(data); // Assuming `setPosts` updates your `posts` state
    } catch (error) {
      console.error("Error fetching posts by category:", error);
    }
  };
  

  // Post View function
  const postView = async (postId, userId) => {
    try {
      const response = await fetch(`${baseUrl}/posts/${postId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }) // Send userId in request body
      });
  
      if (response.ok) {
        const data = await response.json();
        // Update the views count in the state for that post
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, views: data.views } : post
          )
        );
      } else {
        console.error("Failed to update views");
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };
  

  return (
    <PostsContext.Provider
      value={{
        posts,
        popularPosts,
        categoryPosts,
        loadingCategoryPost,
    fetchCategoryPosts,
        fetchInitialPopularPosts,
        fetchPosts,
        fetchCategoryPosts,
        setPosts,
        likePost,
        sharePost,
        fetchComments,
        comments,
        postComment,
        searchPosts,
        searchTerm,
        setSearchTerm,
        postView,
        isLoading :loading,
        loadingMore,
        loadTriggerRef,
        hasMore
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}
