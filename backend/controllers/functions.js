import post from '../models/post.js';
import User from '../models/user.js';

export const updateUserInterests = async (userId, postId) => {
  try {
    const Post = await post.findById(postId);
    if (!Post) return;

    const user = await User.findById(userId);
    if (!user) return;

    const interests = user.interests || {
      categories: [],
      tags: [],
      authors: []
    };

    // Helper to add an item with uniqueness and max length
    const addWithLimit = (array, item, limit = 10) => {
      const updated = array.filter((x) => x !== item);
      updated.push(item);
      return updated.slice(-limit);
    };

    interests.categories = addWithLimit(interests.categories, Post.category);
    interests.authors = addWithLimit(interests.authors, Post.author);
    Post.tags.forEach(tag => {
      interests.tags = addWithLimit(interests.tags, tag);
    });

    user.interests = interests;

    await user.save();

  } catch (error) {
    console.error("Failed to update user interests:", error.message);
  }
};
