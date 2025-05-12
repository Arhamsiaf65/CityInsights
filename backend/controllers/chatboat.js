import express from 'express';
import { GoogleGenAI, createUserContent } from '@google/genai';
import post from '../models/post.js';
import user from '../models/user.js';
import nlp from 'compromise';

const router = express.Router();
const geminiKey = process.env.GEMINI_KEY;
const ai = new GoogleGenAI({ apiKey: geminiKey });

// ✨ Utility: Clean Gemini output
const cleanGeminiOutput = (text) => text.replace(/\*/g, '').trim();

// ✨ Utility: Greeting handler
const handleGreeting = (msg) => {
  const greetings = ['hi', 'hello', 'hey', 'salam', 'assalamu alaikum'];
  return greetings.some(g => msg.toLowerCase().includes(g));
};

// ✨ Utility: Default assistant response
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

// ✨ Utility: Get user context
const getUserPersonalizedMessage = async (userId) => {
  if (!userId) return '';
  try {
    const currentUser = await user.findById(userId).select('name role');
    return currentUser ? `This is from ${currentUser.name} (${currentUser.role}).` : '';
  } catch {
    return '';
  }
};

// ✨ Extract topic from message
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

// ✨ Extract author name
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

// ✨ Extract tag or category
const extractTagOrCategory = (msg) => {
  const tag = msg.match(/(?:tagged with|in tag) ([a-z0-9\- ]+)/i);
  const cat = msg.match(/(?:category|under category|in category) ([a-z0-9\- ]+)/i);
  return tag?.[1] || cat?.[1] || null;
};

// ✨ FAQs and responses
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

// ✅ MAIN ROUTE: POST /chat
router.post('/', async (req, res) => {
  const { message, userId } = req.body;
  const context = await getUserPersonalizedMessage(userId);

  try {
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        createUserContent([
          `You're an assistant for City Insight (Sahiwal-based news platform).`,
          `User context: ${context || 'No user data'}`,
          `User message: "${message}"`,
          `If the user wants DB results, reply with [FETCH:<intent>].`,
          `Valid intents: latest posts, posts by author, posts by tag or category, platform info.`,
        ]),
      ],
    });

    const reply = cleanGeminiOutput(aiResponse.text);

    // If Gemini returns fetch intent
    if (reply.startsWith('[FETCH:')) {
      const intent = reply.match(/\[FETCH:(.*?)\]/)?.[1]?.toLowerCase().trim();

      switch (intent) {
        case 'latest posts': {
          try {
            // Fetch the latest posts, populated with the author details
            const postsList = await post
              .find()
              .sort({ createdAt: -1 })
              .limit(5)
              .populate('author', 'name');  // Populate author field with only 'name'
        
            // Format the post list with author name instead of ID
            const summary = postsList.map(p => `• ${p.title} — by ${p.author.name} [${p.category}]`).join('\n');
        
            return res.json({ reply: `📰 Latest posts:\n${summary}` });
          } catch (error) {
            console.error(error);
            return res.json({ reply: '❌ Error fetching latest posts.' });
          }
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
              { tags: { $regex: keyword, $options: 'i' } },
              { category: { $regex: keyword, $options: 'i' } }
            ]
          }).limit(5);

          if (!posts.length) return res.json({ reply: `⚠️ No posts found under "${keyword}".` });

          const summary = posts.map(p => `• ${p.title}`).join('\n');
          return res.json({ reply: `📂 Posts under "${keyword}":\n${summary}` });
        }

        case 'platform info':
          return res.json({ reply: getFallbackResponse() });

        default:
          return res.json({ reply });
      }
    }

    // ✨ Greetings
    if (handleGreeting(message)) {
      return res.json({ reply: `👋 Hello! How can I help you?\n\n${getFallbackResponse()}` });
    }

    // ✨ FAQ Matching
    const faq = faqAnswers(message);
    if (faq) return res.json({ reply: faq });

    // ✨ Default Gemini reply
    return res.json({ reply });

  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ reply: '❌ AI error. Please try again later.' });
  }
});

export default router;
