import express from 'express';
import { GoogleGenAI, createUserContent } from '@google/genai';
import post from '../models/post.js';
import user from '../models/user.js';
import category from '../models/category.js'
import nlp from 'compromise';


const router = express.Router();
const geminiKey = process.env.GEMINI_KEY;
const ai = new GoogleGenAI({ apiKey: geminiKey });

// ✨ Clean Gemini output
const cleanGeminiOutput = (text) => text.replace(/\*/g, '').trim();

// ✨ Handle greeting
const handleGreeting = (msg) => {
  const greetings = ['hi', 'hello', 'hey', 'salam', 'assalamu alaikum'];
  return greetings.some(g => msg.toLowerCase().includes(g));
};

// ✨ Fallback / Help response
const getFallbackResponse = () => `🤖 Here's how I can assist you:

- 📚 Ask about City Insight and your account
- 📰 Find posts by:
   • Topic — "Tell me about education"
   • Tag — "Tagged with tech"
   • Category — "Category sports"
- ✍️ Posts by authors — "Posts by Ali Khan"
- ℹ️ Platform info — "What is City Insight?", "How to apply as publisher?"
- 👤 Profile help — "Am I a publisher?", "What is my role?"

🧠 Try: "Latest news", "Posts about politics", "Contact support"`;

// ✨ User info for personalization
const getUserPersonalizedMessage = async (userId) => {
  if (!userId) return '';
  try {
    const currentUser = await user.findById(userId).select('name role');
    return currentUser ? `This is from ${currentUser.name} (${currentUser.role}).` : '';
  } catch {
    return '';
  }
};

// ✨ NLP extraction helpers
const extractNewsTopic = (msg) => {
  const lower = msg.toLowerCase();
  const triggers = ['news about', 'tell me about', 'update on', 'any article on', 'information on', 'latest on'];
  for (let t of triggers) {
    if (lower.includes(t)) {
      const topic = lower.split(t)[1]?.trim();
      return topic?.length > 2 ? topic : null;
    }
  }
  if (lower.includes('news')) {
    const words = lower.split(' ');
    const i = words.indexOf('news');
    const topic = words[i - 1];
    return topic?.length > 2 ? topic : null;
  }
  return null;
};

const extractAuthorName = (msg) => {
  const doc = nlp(msg);
  const people = doc.people().out('array');
  if (people.length) return people[0];
  const patterns = [
    /posts by ([a-z ]+)/i,
    /content from ([a-z ]+)/i,
    /articles by ([a-z ]+)/i,
    /written by ([a-z ]+)/i
  ];
  for (const p of patterns) {
    const match = msg.match(p);
    if (match?.[1]) return match[1].trim();
  }
  return null;
};

const extractTagOrCategory = (msg) => {
  // Match tags
  const tag = msg.match(/(?:tagged with |tag|in tag|about tag|on tag|related to tag|tags?)\s*[:\-]?\s*([a-z0-9\- ]+)/i);
  
  // Match categories
  const cat = msg.match(/(?:category|under category|in category|about category|related to category|categories?)\s*[:\-]?\s*([a-z0-9\- ]+)/i);

  // Match keywords like "security" (or any other topic)
  const keyword = msg.match(/(?:posts about|related to|concerning|on)\s*([a-z0-9\- ]+)/i);
  
  // Return the first valid match (priority order: tag > category > keyword)
  return tag?.[1] || cat?.[1] || keyword?.[1] || null;
};


// ✨ FAQs
const faqKeywords = [
  {
    keywords: ['apply', 'publisher'],
    answer: "Click 'Apply Publisher' in the navbar and fill the form. We'll review your request in 24 hours.",
  },
  {
    keywords: ['contact'],
    answer: "Click the 'Contact Us' button in the top navigation bar.",
  },
  {
    keywords: ['advertise', 'ads'],
    answer: "Yes! Visit the 'Ads' section to publish your advertisements with us.",
  }
];

const faqAnswers = (msg) => {
  const normalized = msg.toLowerCase();
  for (const { keywords, answer } of faqKeywords) {
    if (keywords.every(k => normalized.includes(k))) return answer;
  }
  return null;
};

function extractPostTitle(message) {
  // Look for titles wrapped in quotes (single or double)
  const match = message.match(/['"`](.*?)['"`]/); // Match any text inside quotes (including single quotes)
  if (match) return match[1].trim();

  // Alternatively, check for messages like "Tell me about XYZ post"
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('about') || lowerMessage.includes('the title of')) {
    const parts = message.split(/about|title of/i);
    if (parts[1]) return parts[1].trim();
  }

  // If no specific title is identified, return null
  return null;
}



// ✅ MAIN ROUTE
router.post('/', async (req, res) => {
  const { message, userId } = req.body;
  const context = await getUserPersonalizedMessage(userId);

  try {

    // ✨ Greet
    if (handleGreeting(message)) {
      return res.json({ reply: `👋 Hello! How can I help you?\n\n${getFallbackResponse()}` });
    }

    // ✨ FAQ
    const faq = faqAnswers(message);
    if (faq) return res.json({ reply: faq });


    // ✨ Ask Gemini to analyze the message
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        createUserContent([
          `You're an assistant for City Insight (Sahiwal-based news platform) developed as FYP by students of CUI Sahiwal.`,
          `User context: ${context || 'No user data'}`,
          `User message: "${message}"`,
          `If the user wants DB results, reply with [FETCH:<intent>].`,
          `Valid intents: latest posts, posts by author, posts by tag or category, post by title, platform info, user info.`,
          `This is developed by Alisha, Roman, and Laiba.`,
          `Examples of user info: "What is my role?", "Am I a publisher?", "Tell me about myself."`,
          `If you fail to detect intent, do NOT reply with fetch. Give a helpful natural reply instead.`,
          `If the user asks about a specific post like "Tell me about 'Theft in Sahiwal'" or includes the post title in quotes, reply with [FETCH:post by title].`,
          `If the user asks like "posts about security", do valid intent as posts by tag or category.`,
        ]),
      ],
    });

    const reply = cleanGeminiOutput(aiResponse.text);



    // ✨ Handle intent if AI returned [FETCH:<intent>]
    const intentMatch = reply.match(/\[FETCH:(.*?)\]/i);


if (intentMatch) {
  const intent = intentMatch[1].toLowerCase().trim();

  switch (intent) {
    case 'latest posts': {
      const postsList = await post.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name');
      const summary = postsList.map(p => `• ${p.title} — by ${p.author.name}`).join('\n');
      return res.json({ reply: `📰 Latest posts:\n${summary}` });
    }

    case 'user info': {
      if (!userId) return res.json({ reply: "⚠️ You're not logged in, so I can't fetch your role or profile." });

      const currentUser = await user.findById(userId).select('name role');
      if (!currentUser) return res.json({ reply: "❌ User not found." });

      return res.json({ reply: `👤 Your name is *${currentUser.name}* and your role is *${currentUser.role}*.` });
    }

    case 'posts by author': {
      const name = extractAuthorName(message);
      if (!name) return res.json({ reply: "❌ Couldn't identify the author's name." });

      const authors = await user.find({ name: { $regex: name, $options: 'i' } });
      if (!authors.length) return res.json({ reply: `❌ No author found with name "${name}".` });

      const posts = await post.find({ author: { $in: authors.map(a => a._id) } }).populate('author');
      if (!posts.length) return res.json({ reply: `⚠️ No posts by "${name}".` });

      const summary = posts.map(p => `🔹 *${p.title}* by ${p.author.name}`).join('\n');
      return res.json({ reply: summary });
    }

    case 'posts by tag or category': {
      const keyword = extractTagOrCategory(message);
      if (!keyword) return res.json({ reply: "❓ Please specify a tag or category." });

      const posts = await post.find({
        $or: [
          { tags: { $regex: new RegExp(keyword, 'i') } },
          { category: { $in: await category.find({ name: { $regex: new RegExp(keyword, 'i') } }).select('_id') } }
        ]
      }).limit(5);

      if (!posts.length) return res.json({ reply: `⚠️ No posts found under "${keyword}".` });

      const summary = posts.map(p => `• ${p.title}`).join('\n');
      return res.json({ reply: `📂 Posts under "${keyword}":\n${summary}` });
    }

    case 'post by title':
    case 'posts by title': { // both cases supported
      const title = extractPostTitle(message);
      if (!title) return res.json({ reply: "❌ Couldn't identify the post title." });

      const matchedPosts = await post.find({
        title: { $regex: new RegExp(title, 'i') }
      }).populate('author', 'name');

      if (!matchedPosts.length)
        return res.json({ reply: `⚠️ No posts found with title similar to "${title}".` });

        const summary = matchedPosts.map(p => {
          // Get the first 100 characters of the post content for a snippet
          const snippet = p.content ? p.content.substring(0, 100) + '...' : 'No content preview available';
        
          return `🔸 *${p.title}* — by *${p.author.name}* [${p.category}]\n📅 Created on: ${new Date(p.createdAt).toLocaleDateString()} \n📝 Snippet: "${snippet}"\n`;
        }).join('\n');
        
      return res.json({ reply: `📌 Posts matching "${title}":\n${summary}` });
    }

    case 'platform info':
      return res.json({ reply: getFallbackResponse() });

    default:
      return res.json({ reply: '🤖 Sorry, I didn’t understand that intent. Try asking about news, authors, tags or City Insight info.' });
  }
}




    // ✨ Default Gemini answer
    return res.json({ reply });

  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ reply: '❌ AI error. Please try again later.' });
  }
});

export default router;
