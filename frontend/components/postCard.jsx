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
  FaChevronRight,
  FaEllipsisH,
  FaArrowCircleRight
} from "react-icons/fa";
import { PostsContext } from "../context/postContext";
import { userContext } from "../context/userContext";
import { copyLinkToClipboard, shareOnPlatform } from "./sharePOst";
import { toast } from "react-hot-toast";

const PostCard = ({ id, image, title, description, link, details, author, likes }) => {
  const [showShareCard, setShowShareCard] = useState(false);
  const navigate = useNavigate();
  const { likePost, sharePost } = useContext(PostsContext);
  const { user } = useContext(userContext);

  const handleShareClick = (platform, postId) => {
    shareOnPlatform(platform, postId);
    let toastShown = false;
    const handleFocus = () => {
      if (!toastShown) {
        toast(
          (t) => (
            <div className="flex flex-col items-start">
              <span className="font-semibold">
                Thanks for sharing. Did you remain successful?
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
          ),
          { duration: Infinity, position: "bottom-left" }
        );
        toastShown = true;
      }
    };
    window.addEventListener("focus", handleFocus);
  };

  return (
    <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl  transition-all duration-300 relative group">
  {/* Image */}
  <div
    className="relative overflow-hidden rounded-t-2xl cursor-pointer"
    onClick={() => navigate(`/post/${id}`)}
  >
    <img
      src={image}
      alt={title}
      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
    />
  </div>

  {/* Content */}
  <div className="p-5 space-y-2">
    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
  </div>

  {/* Bottom Action Bar */}
  <div className="flex items-center justify-between px-5 py-4 border-t bg-gray-50 rounded-b-2xl">
    {/* Author */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
        {author?.avatar ? (
          <img src={author.avatar} alt="Author Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">👤</div>
        )}
      </div>
      {author?.name && <span className="text-sm text-gray-700">{author.name}</span>}
    </div>

    {/* Actions */}
    <div className="flex items-center gap-4">
      <button
        className="flex items-center gap-1 text-red-500 hover:text-red-600"
        onClick={() => likePost(id, user._id)}
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

  {/* Share Card */}
  {showShareCard && (
    <div className="absolute bottom-20 right-4 bg-white shadow-lg rounded-xl w-56 py-4 px-3 z-30 border">
      <p className="text-sm font-semibold text-gray-800 mb-3">Share on</p>
      <div className="grid grid-cols-4 gap-3 text-center">
        <button onClick={() => handleShareClick("facebook", id)} className="text-blue-600 hover:text-blue-800"><FaFacebook /></button>
        <button onClick={() => handleShareClick("whatsapp", id)} className="text-green-600 hover:text-green-800"><FaWhatsapp /></button>
        <button onClick={() => handleShareClick("linkedin", id)} className="text-blue-700 hover:text-blue-900"><FaLinkedin /></button>
        <button onClick={() => copyLinkToClipboard(window.location.origin + `/post/${id}`)} className="text-gray-600 hover:text-gray-800"><FaCopy /></button>
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
