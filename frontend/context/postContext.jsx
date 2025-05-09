import { createContext, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ErrorToast } from "../components/toast";

export const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const isFetchingRef = useRef(false);

  const fetchPosts = async (categorySlug = selectedCategory, search = searchTerm) => {
    const token = Cookies.get("token");

    if (!hasMore || isFetchingRef.current) return;

    const isFirstFetch = posts.length === 0;
    isFirstFetch ? setLoading(true) : setLoadingMore(true);
    isFetchingRef.current = true;

    try {
      const url = `${baseUrl}/posts/fetch?skip=${skip}&limit=10${
        categorySlug ? `&category=${categorySlug}` : ""
      }${search ? `&search=${search}` : ""}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.length < 10) setHasMore(false);

      setPosts((prevPosts) => {
        const existingIds = new Set(prevPosts.map(post => post._id.toString()));
        const popularIds = new Set(popularPosts.map(post => post._id.toString()));
        const newPosts = data.filter(post => !existingIds.has(post._id.toString()) && !popularIds.has(post._id.toString()));
        return [...prevPosts, ...newPosts];
      });

      setSkip(prev => prev + 10);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchCategoryPosts = async (categorySlug, search = "") => {
    try {
      const response = await fetch(`${baseUrl}/posts?category=${categorySlug}&search=${search}`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch category posts:", error);
    }
  };

  useEffect(() => {
    setPosts([]);
    setSkip(0);
    setHasMore(true);
    fetchPosts();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const fetchInitialPopularPosts = async () => {
      try {
        const response = await fetch(`${baseUrl}/posts/popular`);
        const data = await response.json();
        const postIds = new Set(posts.map(post => post._id.toString()));
        const filteredPopular = data.filter(post => !postIds.has(post._id.toString()));
        setPopularPosts(filteredPopular);
      } catch (error) {
        console.error("Failed to fetch popular posts:", error);
      }
    };

    fetchInitialPopularPosts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isBottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100;

      if (isBottom) fetchPosts();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [skip, hasMore, loading, searchTerm, selectedCategory]);

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`${baseUrl}/comments/${postId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

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
        toast.custom(
          (t) => <ErrorToast t={t} title="Error" message="Failed to like/unlike post. Login to perform action" />,
          { duration: 400 }
        );
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
      toast.custom(
        (t) => (
          <ErrorToast
            t={t}
            title="Error"
            message="An unexpected error occurred while liking/unliking the post."
          />
        ),
        { duration: 400 }
      );
      navigate("/login");
    }
  };

  const sharePost = async (postId) => {
    try {
      const response = await fetch(`${baseUrl}/posts/${postId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
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
        setComments((prev) => [data.comment, ...(Array.isArray(prev) ? prev : [])]);
      } else {
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

  const searchPosts = async (query) => {
    setSearchTerm(query);
  };

  const postView = async (postId) => {
    try {
      const response = await fetch(`${baseUrl}/posts/${postId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, views: data.views } : post
          )
        );
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
        selectedCategory,
        setSelectedCategory,
        postView,
        isLoading: loading,
        loadingMore,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}
