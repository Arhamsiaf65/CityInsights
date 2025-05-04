import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaShareAlt,
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaCopy,
  FaTimesCircle,
  FaLinkedin,
  FaArrowCircleRight,
} from "react-icons/fa";
import { PostsContext } from "../context/postContext";
import { userContext } from "../context/userContext";
import { copyLinkToClipboard, shareOnPlatform } from "./sharePOst";
import { toast } from "react-hot-toast";

const PostCard = ({
  id,
  image,
  title = "Untitled",
  description = "No description available.",
  link = "#",
  author = {},
  likes = 0,
  showActions = true, // Toggle for bottom bar
}) => {
  const [showShareCard, setShowShareCard] = useState(false);
  const navigate = useNavigate();
  const { likePost, sharePost } = useContext(PostsContext);
  const { user } = useContext(userContext);

  const handleShareClick = (platform) => {
    shareOnPlatform(platform, id);
    let toastShown = false;

    const handleFocus = () => {
      if (!toastShown) {
        toast((t) => (
          <div className="flex flex-col items-start">
            <span className="font-semibold">
              Thanks for sharing. Did it work?
            </span>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  sharePost(id);
                  toast.dismiss(t.id);
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

  return (
    <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl relative group transition-all duration-300">
    {/* Clickable Area (Image + Content) */}
    <div
      className="cursor-pointer"
      onClick={() => navigate(`/post/${id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={image}
          alt={title}
          className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
  
      {/* Content */}
      <div className="p-5 space-y-2">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
      </div>
    </div>
  
    {/* Actions (Not Clickable for Navigation) */}
    {showActions && (
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between px-5 py-4 border-t bg-gray-50 rounded-b-2xl"
      >
        {/* Author Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {author?.avatar ? (
              <img src={author.avatar} alt="Author" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-lg">👤</div>
            )}
          </div>
          <span className="text-sm text-gray-700">{author?.name || "Anonymous"}</span>
        </div>
  
        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => likePost(id, user?._id)}
            className="flex items-center gap-1 text-red-500 hover:text-red-600"
          >
            <FaHeart />
            <span className="text-sm">{likes}</span>
          </button>
          <button
            onClick={() => setShowShareCard(true)}
            className="text-blue-500 hover:text-blue-600"
            title="Share"
          >
            <FaShareAlt />
          </button>
          <Link
            to={`/post/${id}`}
            title="View Details"
            className="text-gray-600 hover:text-gray-900"
          >
            <FaArrowCircleRight />
          </Link>
        </div>
      </div>
    )}
  
    {/* Share Card */}
    {showShareCard && (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-20 right-4 z-30 bg-white shadow-xl rounded-xl w-56 p-4 border"
      >
        <p className="text-sm font-semibold text-gray-800 mb-3">Share on</p>
        <div className="grid grid-cols-4 gap-3 text-center">
          <button
            onClick={() => handleShareClick("facebook")}
            className="text-blue-600 hover:text-blue-800"
          >
            <FaFacebook />
          </button>
          <button
            onClick={() => handleShareClick("whatsapp")}
            className="text-green-600 hover:text-green-800"
          >
            <FaWhatsapp />
          </button>
          <button
            onClick={() => handleShareClick("linkedin")}
            className="text-blue-700 hover:text-blue-900"
          >
            <FaLinkedin />
          </button>
          <button
            onClick={() =>
              copyLinkToClipboard(id)
            }
            className="text-gray-600 hover:text-gray-800"
          >
            <FaCopy />
          </button>
        </div>
        <button
          onClick={() => setShowShareCard(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <FaTimesCircle />
        </button>
      </div>
    )}
  </div>
  
  
  );
};

export default PostCard;
