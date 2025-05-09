import post from '../models/post.js';
import User from '../models/user.js';

export const updateUserInterests = async (userId, postId) => {
    try {
      const Post = await post.findById(postId);
      if (!Post) return;
  
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          'interests.categories': Post.category,
          'interests.tags': { $each: Post.tags },
          'interests.authors': Post.author
        }
      });
    } catch (error) {
      console.error("Failed to update user interests:", error.message);
    }
  };