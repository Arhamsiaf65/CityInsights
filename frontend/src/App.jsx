import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Toaster } from 'react-hot-toast';
import { PostsProvider } from "../context/postContext";
import { CategoriesProvider } from "../context/categoriesContext";
import { UserProvider } from "../context/userContext";
import { AdProvider } from "../context/addContext";

import Navbar from "../components/navBar";
import Home from "../pages/home";
import About from "../pages/about";
import Category from "../pages/category";
import Contact from "../pages/contact";
import PostDetail from "../pages/postDetail";
import AuthPage from "../pages/auth";
import User from "../pages/user";
import PublisherRole from "../pages/publisherRole";
import ScrollToTop from "../components/scrollToTop";
import Chatbot from "../components/chatbot";
import Footer from "../components/footer";

import { Bot } from "lucide-react";  // icon

function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />
      <UserProvider>
        <PostsProvider>
          <CategoriesProvider>
            <AdProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<AuthPage type="login" />} />
                <Route path="/signup" element={<AuthPage type="signup" />} />
                <Route path="/category/:categorySlug" element={<Category />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/user/:id" element={<User />} />
                <Route path="/apply-publisher" element={<PublisherRole />} />
              </Routes>
              <Footer />

              {/* ✅ Floating Chat Icon */}
              <div className="fixed bottom-6 right-6 z-50">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
                >
                  <Bot size={24} />
                </button>
              </div>

              {/* ✅ Chatbot Box */}
              {showChat && (
                <div className="fixed bottom-20 right-6 z-50 w-full max-w-sm">
                  <Chatbot/>
                </div>
              )}
            </AdProvider>
          </CategoriesProvider>
        </PostsProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
