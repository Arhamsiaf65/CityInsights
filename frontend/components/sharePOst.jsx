import toast from "react-hot-toast";
import { SuccessToast, ErrorToast } from "./toast";
import { PostsContext } from "../context/postContext";
import { useContext } from "react";
const frontEndBaseUrl = import.meta.env.VITE_froneEndBaseUrl;


export const shareOnPlatform = (platform, postId, sharePost) => {
    const postUrl = `${frontEndBaseUrl}/post/${postId}`;
  
    let shareLink = '';
  
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check this out! ' + postUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      default:
        console.error("Unsupported platform");
        return;
    }
  
    const newTab = window.open(shareLink, "_blank");

    if (!newTab) {
      alert("Popup blocked! Please allow popups for this site.");
    }
  };
  
  
  
  

  

// 3. Copy Post Link to Clipboard
export const copyLinkToClipboard = (postId) => {
  const postUrl = `${frontEndBaseUrl}/post/${postId}`;
  navigator.clipboard.writeText(postUrl)
    .then(() => {
      toast.custom(
        (t) => (
          <SuccessToast
            t={t}
            title="Copied!"
            message="Post link copied to clipboard."
          />
        ),
        { duration: 4000 }
      );
    })
    .catch((error) => {
      console.error("Error copying link:", error);
      toast.custom(
        (t) => (
          <ErrorToast
            t={t}
            title="Error"
            message="Failed to copy the link."
          />
        ),
        { duration: 4000 }
      );
    });
};
