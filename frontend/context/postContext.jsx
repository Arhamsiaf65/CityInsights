import { createContext, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { ErrorToast, SuccessToast } from "../components/toast";

export const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({}); // State to store comments for each post
  const [skip, setSkip] = useState(0); // Tracks how many posts we've already fetched
  const [loading, setLoading] = useState(false); // Loading state for fetching posts
  const [hasMore, setHasMore] = useState(true); // Whether there are more posts to load
  const [searchTerm, setSearchTerm] = useState(""); // State for storing search term
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const isFetchingRef = useRef(false); // Prevent multiple fetches

  // Fetch posts
  const fetchPosts = async (categorySlug, search = "") => {
    if (loading || !hasMore || isFetchingRef.current) return;
  
    setLoading(true);
    isFetchingRef.current = true;
  
    try {
      const response = await fetch(
        `${baseUrl}/posts/fetch?skip=${skip}&limit=10&category=${categorySlug}&search=${search}`
      );
      const data = await response.json();
  
      if (data.length < 10) {
        setHasMore(false);
      }
      
      setPosts((prevPosts) => [...prevPosts, ...data]);
      setSkip((prevSkip) => prevSkip + 10);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };
  

  const fetchCategoryPosts = async (categorySlug, search = "") => {
    try {
      const response = await fetch(
        `${baseUrl}/posts?category=${categorySlug}&search=${search}`
      );
      const data = await response.json();
  
      setPosts(data); // Replace current posts
    } catch (error) {
      console.error("Failed to fetch category posts:", error);
    }
  };
  
  
  
  // Load posts on mount
  useEffect(() => {
    fetchPosts();
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
      setPosts([]); // Clear posts when query is empty
      setSkip(0);
      setHasMore(true);
      fetchPosts(); // Fetch all posts again if no search term
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/posts/search?q=${query}`);
      const data = await response.json();
      setPosts(data); // Set the filtered posts
      setSkip(data.length); // Update skip to the number of posts found
      setHasMore(false); // No more posts to fetch for the search
    } catch (error) {
      console.error("Failed to search posts:", error);
    }
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
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
        isLoading :loading
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}
