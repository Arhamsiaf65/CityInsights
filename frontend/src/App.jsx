import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PostsProvider } from "../context/postContext";
import { CategoriesProvider } from "../context/categoriesContext";
import { useState } from "react";
import { Toaster } from 'react-hot-toast';
import Navbar from "../components/navBar";
import Home from "../pages/home";
import About from "../pages/about";
import Category from "../pages/category";
import Contact from "../pages/contact";
import PostDetail from "../pages/postDetail";
import AuthPage from "../pages/auth";
import User from "../pages/user";
import { UserProvider } from "../context/userContext";
import { AdProvider } from "../context/addContext";
import PublisherRole from "../pages/publisherRole";
import ScrollToTop from "../components/scrollToTop";

function App() {
  const [count, setCount] = useState(0);

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
      </AdProvider>
      </CategoriesProvider>
      </PostsProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
