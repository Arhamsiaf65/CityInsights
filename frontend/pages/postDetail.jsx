


import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/postCard";
import { PostsContext } from "../context/postContext";
import { FaEye, FaShare, FaThumbsUp } from "react-icons/fa";
import { FaFacebook, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { shareOnPlatform } from "../components/sharePOst";
import { userContext } from "../context/userContext";
import { AdContext } from "../context/addContext";

const PostDetail = () => {
  const { popularPosts, posts, likePost, sharePost, comments, postComment, fetchComments, postView, isLoading } = useContext(PostsContext);
  console.log(posts);
  const { isLogin, user } = useContext(userContext);
  const { ad } = useContext(AdContext);
  const { id } = useParams();
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const navigate = useNavigate();

  const [commentContent, setCommentContent] = useState("");
  const [visibleComments, setVisibleComments] = useState(2);

  const allPosts = [...posts, ...popularPosts];
  const post =  allPosts.find((p) => p._id === id);
  const relatedPosts = allPosts.filter((p) => p._id !== id && p.category.name === post?.category?.name).slice(0, 6);


  useEffect(() => {
    fetchComments(id);
    postView(id);
  }, []);

  if (isLoading || !post) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
            <p className="text-lg">Loading post details...</p>
          </>
        ) : (
          <>
            <p className="text-lg mb-4">Post not found.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    );
  }

  const handlePostComment = () => {
    if (!isLogin) {
      toast.error("Please login first to comment");
      navigate("/login");
      return;
    }

    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    postComment(post._id, commentContent, user.id);
    toast.success("Comment posted!");
    setCommentContent("");
  };

  const handleShareClick = (platform, postId) => {
    shareOnPlatform(platform, postId);

    let toastShown = false;

    const handleFocus = () => {
      if (!toastShown) {
        toast((t) => (
          <div className="flex flex-col items-start">
            <span className="font-semibold mb-2">
              Thanks for sharing! Were you successful?
            </span>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  sharePost(postId);
                  toast.dismiss(t.id);
                  toastShown = true;
                }}
                className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
              >
                Yes
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
              >
                No
              </button>
            </div>
          </div>
        ), { duration: Infinity, position: "bottom-left" });

        toastShown = true;
      }
    };

    window.addEventListener("focus", handleFocus, { once: true });
  };

  const renderMiddleAd = () => (
    <div className="my-10 w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-yellow-200">
      <div className="bg-yellow-100 px-4 py-2 text-xs font-bold uppercase text-yellow-800 tracking-wide">
        Sponsored Ad
      </div>
      {Array.isArray(ad.images) && ad.images.length > 0 && (
        <img
          src={ad.images[0]}
          alt={ad.title || "Advertisement"}
          className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
        />
      )}
      <div className="p-6 flex flex-col items-center text-center space-y-3">
        <h3 className="text-2xl font-bold text-gray-800">{ad.title || "Untitled Ad"}</h3>
        <p className="text-sm text-gray-600">{ad.description || "No description available."}</p>
        {ad.businessName && <p className="text-xs text-gray-400 italic">by {ad.businessName}</p>}
        {ad.link ? (
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Learn More
          </a>
        ) : (
          <span className="text-gray-400 text-sm">No link provided</span>
        )}
      </div>
    </div>
  );

  const contentAfterIntro = post.content.slice(250);
  const words = contentAfterIntro.trim().split(/\s+/);
  const wordCount = words.length;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-10 mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
          {post.author?.avatar && (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-medium">{post.author?.name || "Unknown Author"}</div>
            <div className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString()} • {post.category?.name || "Uncategorized"}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          {post.images?.[0] && (
            <div className="flex-shrink-0 w-full lg:w-1/2 overflow-hidden rounded-xl shadow-md">
              <img
                src={post.images[0]}
                alt={post.title}
                className="w-full h-[300px] object-cover rounded-xl hover:scale-105 transition-transform duration-500 ease-in-out"
              />
            </div>
          )}

          <div className="w-full lg:w-1/2 text-gray-700 text-base sm:text-lg leading-relaxed">
            {post.content.slice(0, 250)}...
          </div>
        </div>

        {/* Full Content */}
        <div className="text-gray-700 leading-relaxed space-y-5 text-base sm:text-lg border-t pt-6">
          {(() => {
            if (wordCount > 300 && ad) {
              const halfway = Math.floor(words.length / 2);
              const firstHalf = words.slice(0, halfway).join(" ");
              const secondHalf = words.slice(halfway).join(" ");
              return (
                <>
                  <p>{firstHalf}</p>
                  {renderMiddleAd()}
                  <p>{secondHalf}</p>
                </>
              );
            } else {
              return <p>{contentAfterIntro}</p>;
            }
          })()}
        </div>

        {/* Tags and Interaction */}
        <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mt-8">
          {post.tags?.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="bg-gray-100 px-2 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            <button
              onClick={() => likePost(post._id, user.id)}
              className={`flex gap-1 items-center hover:text-blue-600 transition ${post.isLiked ? "text-blue-600" : ""}`}
            >
              <FaThumbsUp /> {post.likes}
            </button>
            <button onClick={() => handleShareClick("facebook", post._id)} className="flex gap-1 hover:text-blue-600">
              <FaFacebook /> {post.shares}
            </button>
            <button onClick={() => handleShareClick("whatsapp", post._id)} className="hover:text-green-600">
              <FaWhatsapp />
            </button>
            <button onClick={() => handleShareClick("linkedin", post._id)} className="hover:text-blue-700">
              <FaLinkedin />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {Array.isArray(comments) && comments.length === 0 ? (
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(comments) && comments.slice(0, visibleComments).map((comment) => (
                    <div key={comment._id} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg shadow-sm">
                      <img
                        src={comment.user.avatar || defaultAvatar}
                        alt={comment.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">{comment.user.name}</div>
                        <p className="text-gray-700 mt-1">{comment.content}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {visibleComments < comments.length && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setVisibleComments((prev) => prev + 3)}
                    className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                  >
                    Load More Comments
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Comment */}
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Leave a Comment</h2>
          <textarea
            rows="4"
            placeholder="Write your comment here..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          ></textarea>
          <button
            onClick={handlePostComment}
            className="mt-3 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Post Comment
          </button>
        </div>
      </div>

      {/* Bottom Ad (Only for short content) */}
      {ad && wordCount <= 300 && renderMiddleAd()}
    </div>
  );
};

export default PostDetail;

