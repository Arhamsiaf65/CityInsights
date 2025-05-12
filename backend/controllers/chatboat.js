import express from 'express';
import { GoogleGenAI, createUserContent } from '@google/genai';
import post from '../models/post.js';
import user from '../models/user.js';

const geminiKey = process.env.GEMINI_KEY;
const ai = new GoogleGenAI({ apiKey: geminiKey });
const router = express.Router();
const messageHistory = {};



const cleanGeminiOutput = (text) => {
  return text.replace(/\*/g, ''); // Remove all asterisks
};


// ✅ Helper functions
const handleGreeting = (message) => {
  const greetings = ["hi", "hello", "hey", "greetings", "good morning", "good evening", "salam", "assalamu alaikum"];
  return greetings.some(greet => message.toLowerCase().includes(greet));
};


const getFallbackResponse = () => {
  return `🤖 Here's how I can assist you:\n
- 📚 Answer questions about City Insight and your account\n
- 📰 Show latest posts or articles by:\n
    • Topic — try: "Tell me about education"\n
    • Tag — try: "Tagged with tech", "Has tag culture", "In tag health"\n
    • Category — try: "Category sports", "In category business", "Under category news"\n
- ✍️ Posts by specific authors:\n
    • Try: "Posts by Ali Khan", "Content from Maria"\n
- ℹ️ Share platform info (like how to become a publisher):\n
    • Try: "Tell me about City Insight", "How to apply as publisher"\n
- 👤 Help you manage your user profile:\n
    • Try: "Am I a publisher?", "What is my role?"\n
\n
🧠 Example questions:\n
• "Show latest posts"\n
• "Who am I?"\n
• "News about sports"\n
• "How do I contact support?"\n
• "How to apply as publisher"\n`;
};





const getUserPersonalizedMessage = async (userId) => {
  if (!userId) return '';
  try {
    const currentUser = await user.findById(userId).select('name');
    return currentUser?.name ? `This message is from ${currentUser.name}. ` : '';
  } catch {
    return '';
  }
};

const extractNewsTopic = (message) => {
  const keywords = ['news about', 'tell me about', 'update on', 'any article on', 'information on', 'latest on'];
  const lowerMsg = message.toLowerCase();

  for (let keyword of keywords) {
    if (lowerMsg.includes(keyword)) {
      const topic = lowerMsg.split(keyword)[1]?.trim();
      return topic?.length > 2 ? topic : null;
    }
  }

  if (lowerMsg.includes('news')) {
    const words = lowerMsg.split(' ');
    const index = words.indexOf('news');
    const topic = words[index - 1];
    return topic?.length > 2 ? topic : null;
  }

  return null;
};

const extractAuthorName = (msg) => {
  const patterns = [
    /posts by ([a-z ]+)/i,
    /articles by ([a-z ]+)/i,
    /what did ([a-z ]+) post/i,
    /([a-z ]+)'s posts/i,
    /([a-z ]+)'s articles/i,
    /show posts by ([a-z ]+)/i,
    /show articles by ([a-z ]+)/i,
    /written by ([a-z ]+)/i,
    /authored by ([a-z ]+)/i,
    /content from ([a-z ]+)/i,
    /what is latest by ([a-z ]+)/i,
    /latest post by ([a-z ]+)/i,
    /latest from ([a-z ]+)/i,
    /new post by ([a-z ]+)/i,
    /any post by ([a-z ]+)/i,
    /has ([a-z ]+) posted/i,
    /did ([a-z ]+) write/i
  ];

  for (const pattern of patterns) {
    const match = msg.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
};

const extractTagOrCategory = (msg) => {
  const tagPattern = /(?:tagged with|has tag|with tag|in tag) ([a-z0-9\- ]+)/i;
  const catPattern = /(?:category|in category|under category) ([a-z0-9\- ]+)/i;
  return msg.match(tagPattern)?.[1] || msg.match(catPattern)?.[1] || null;
};



const isPlatformInfoQuery = (msg) =>
  /who (are|is) (you|this)|what is (city insight|cia|this platform|this site)|tell me about (city insight|cia|this platform|this site)|explain (city insight|cia|this platform|this site)|what do you do/i.test(msg);


const faqAnswers = {
  "how to apply as publisher": "To apply as a publisher, go to navigation bar and click 'Apply Publisher'. We’ll review your request soon!",
  "how do i contact": "You can contact us via the Contact page from the navigation bar. We usually reply within 24 hours.",
  "can i advertise": "Yes! You could publish your ads with us. Head to us to get started."
};

// ✅ Main Chatbot Route
router.post('/', async (req, res) => {
  const { message, userId } = req.body;
  const lower = message.toLowerCase();

  try {
    // 1. Greetings
    if (handleGreeting(message)) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          createUserContent([`The user greeted: "${message}". Respond warmly and enthusiastically. Give 1–2 short, natural-sounding options, not a full essay.

          Avoid teaching or breaking down the psychology of replies unless asked.
          
          Keep tone casual and conversational, like a real person texting. and give only one reply as you are a human being to reply .  don't show the options like:  Hey! It's going alright, thanks for asking. How's yours going? OR Not bad, thanks! What about you?`])
        ]
      });
      return res.json({ reply: response.text });
    }

    // 2. Publisher Role Check
   // ✅ Handle role or user status questions
if (userId) {
  const User = await user.findById(userId).select('role name email verified');

  if (!User) {
    return res.json({ reply: "❌ Sorry, I couldn't find your user account." });
  }

  // Normalize input
  const isPublisherCheck = lower.includes('am i a publisher');
  const isAdminCheck = lower.includes('am i an admin');
  const isVerifiedCheck = lower.includes('am i verified') || lower.includes('am i a verified user');
  const roleQuery = lower.includes('what is my role' || lower.includes('my role'));
  const accountQuery = lower.includes('who am i') || lower.includes('do you know me') || lower.includes('tell me about my account' || lower.includes('about myself') || lower.includes('about me'));

  if (isPublisherCheck) {
    return res.json({
      reply: User.role === 'publisher'
        ? "✅ Yes, you're a verified publisher!"
        : "❌ You are not a publisher yet. You can apply through your profile."
    });
  }

  if (isAdminCheck) {
    return res.json({
      reply: User.role === 'admin'
        ? "✅ You are an admin of this platform."
        : "❌ You are not an admin."
    });
  }

  if (isVerifiedCheck) {
    return res.json({
      reply: User.verified
        ? "✅ Yes, your account is verified."
        : "❌ Your account is not verified yet."
    });
  }

  if (roleQuery) {
    return res.json({
      reply: `🧑‍💼 Your current role is: ${User.role}.`
    });
  }

  if (accountQuery) {
    return res.json({
      reply: `🧾 Your account details:\nName: ${User.name}\nEmail: ${User.email}\nRole: ${User.role}\nVerified: ${User.verified ? "Yes" : "No"}`
    });
  }
}


    // 3. Platform Info
    if (isPlatformInfoQuery(lower)) {
      return res.json({
        reply: `🗺️ City Insight: Sahiwal Edition is your local hub for community news, reviews, and updates in Sahiwal. Whether you're a reader or a publisher, we help you stay informed!`
      });
    }

    // 4. FAQ
    for (const [key, value] of Object.entries(faqAnswers)) {
      if (lower.includes(key)) {
        return res.json({ reply: value });
      }
    }

    // 5. Time/Date Response
    if (lower.includes("time") || lower.includes("date")) {
      const now = new Date();
      return res.json({ reply: `🕒 It's currently ${now.toLocaleString()}` });
    }

    // 6. Posts by Author
    const authorName = extractAuthorName(message);
    if (authorName) {
      const author = await user.findOne({ name: new RegExp(authorName, 'i') });
      if (!author) return res.json({ reply: `❌ Couldn't find any author named "${authorName}".` });

      const postsByAuthor = await post.find({ author: author._id }).limit(3);
      if (!postsByAuthor.length) {
        return res.json({ reply: `👤 ${authorName} has not posted anything yet.` });
      }

      const postList = postsByAuthor.map(p => `• ${p.title}`).join('\n');
      return res.json({ reply: `📝 Here are some posts by ${authorName}:\n${postList}` });
    }


    const tagOrCategory = extractTagOrCategory(message);
if (tagOrCategory) {
  const posts = await post.find({
    $or: [
      { tags: new RegExp(tagOrCategory, 'i') },
      { category: new RegExp(tagOrCategory, 'i') }
    ]
  }).limit(3);

  if (!posts.length) return res.json({ reply: `🔍 No posts found for "${tagOrCategory}".` });

  const summary = posts.map(p => `• ${p.title}`).join('\n');
  return res.json({ reply: `📌 Posts related to "${tagOrCategory}":\n${summary}` });
}

if (lower.includes('top authors') || lower.includes('most active authors')) {
  const topAuthors = await post.aggregate([
    { $group: { _id: '$author', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'authorInfo'
      }
    }
  ]);

  const reply = topAuthors.map(a => `👤 ${a.authorInfo[0]?.name || 'Unknown'} — ${a.count} posts`).join('\n');
  return res.json({ reply: `🏆 Top contributing authors:\n${reply}` });
}



    // 7. News Topic Queries
    const newsTopic = extractNewsTopic(message);
    if (newsTopic) {
      const matchingPosts = await post.find({
        $or: [
          { title: new RegExp(newsTopic, 'i') },
          { content: new RegExp(newsTopic, 'i') }
        ]
      }).sort({ createdAt: -1 }).limit(3);

      if (!matchingPosts.length) {
        return res.json({ reply: `❌ Sorry, I couldn't find any posts about "${newsTopic}".` });
      }

      const summary = matchingPosts.map(p => `Title: ${p.title}\nExcerpt: ${p.content.slice(0, 150)}...`).join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          createUserContent([`Summarize these articles about "${newsTopic}":\n\n${summary}`])
        ]
      });

      return res.json({ reply: response.text });
    }

    // 8. Latest Posts
    if (lower.includes('latest posts') || lower.includes('recent articles') || lower.includes('latest trends')) {
      const Posts = await post.find().sort({ createdAt: -1 }).limit(3);
      const summary = Posts.map(p => `Post title: ${p.title}\nContent: ${p.content.slice(0, 150)}...`).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          createUserContent([`Here are some recent posts:\n\n${summary}\n\nPlease summarize them for the user.`])
        ]
      });

      return res.json({ reply: response.text });
    }

    // 9. General AI Query
    const personalizedMessage = await getUserPersonalizedMessage(userId);
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        createUserContent([`${personalizedMessage}User message: "${message}". Respond in a helpful and intelligent way. Give 1–2 short, natural-sounding options, not a full essay.

        Avoid teaching or breaking down the psychology of replies unless asked.
        
        Keep tone casual and conversational, like a real person texting.`])
      ]
    });

    const botReply = cleanGeminiOutput(response.text);
    // if (!botReply || botReply.includes("don't understand") || botReply.includes("what you need help with") || botReply.includes("describe the situation") || botReply.includes('sorry') || botReply.includes('something went wrong')) {
    //   return res.json({ reply: getFallbackResponse() });
    // }

    res.json({ reply: getFallbackResponse() });

  } catch (err) {
    console.error('Chat error:', err?.response?.data || err.message);
    res.status(500).json({ error: err.message || 'Chatbot failed' });
  }
});

export default router;
