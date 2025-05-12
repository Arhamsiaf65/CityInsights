import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogIn,
  HomeIcon,
  InfoIcon,
  PhoneIcon,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useContext, useRef, useEffect } from "react";
import { CategoriesContext } from "../context/categoriesContext";
import SparkButton from "./ui/sparkButton";
import { userContext } from "../context/userContext";
import CategoryBar from "./categoriesBar";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isExploreMenuOpen, setExploreMenuOpen] = useState(false);
  const [isMobileExploreOpen, setMobileExploreOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hideNavbar, setHideNavbar] = useState(false);

  const { login, logout, user, isLogin } = useContext(userContext);
  const { categories } = useContext(CategoriesContext);

  const mobileMenuRef = useRef(null);
  const exploreMenuRef = useRef(null);
  const profileRef = useRef(null);

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Home", icon: <HomeIcon size={18} /> },
    { to: "/about", label: "About", icon: <InfoIcon size={18} /> },
    { to: "/contact", label: "Contact", icon: <PhoneIcon size={18} /> },
  ];

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }

      if (
        exploreMenuRef.current &&
        !exploreMenuRef.current.contains(event.target) &&
        window.innerWidth >= 768
      ) {
        setTimeout(() => {
          setExploreMenuOpen(false);
        }, 1000);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle scroll to hide/show navbar
  useEffect(() => {
    let prevScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > prevScroll && currentScroll > 100) {
        setHideNavbar(true);
      } else {
        setHideNavbar(false);
      }
      prevScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleExploreMenu = (e) => {
    e.stopPropagation();
    setTimeout(() => {
      setExploreMenuOpen((prev) => !prev);
    }, 1000);
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setMobileMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileExploreOpen(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setTimeout(() => {
      setExploreMenuOpen(false);
    }, 1000);
    setMobileExploreOpen(false);
    navigate(`/category/${category.name}`);
  };

  return (
    <div className="sticky top-0 z-30">
      <CategoryBar />
      <nav
        className={`bg-[#2F5191] text-white px-6 py-5 flex items-center justify-between shadow-md transition-transform duration-300 ${
          hideNavbar ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className=" w-42 sm:w-24 sm:h-10 object-contain" />
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2 mt-2">
          <ul className="flex items-center space-x-6">
            {navItems.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `transition-colors px-4 py-2 duration-200 hover:text-yellow-400 ${
                      isActive ? "text-yellow-400 font-semibold" : "text-white"
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}

            <li
              className="relative"
              onClick={toggleExploreMenu}
              onMouseEnter={() => setExploreMenuOpen(true)}
              onMouseLeave={() =>
                setTimeout(() => {
                  setExploreMenuOpen(false);
                }, 1000)
              }
            >
              <button
                className="hover:text-yellow-400 transition"
                aria-haspopup="true"
                aria-expanded={isExploreMenuOpen}
              >
                Explore
              </button>
              {isExploreMenuOpen && (
                <div
                  ref={exploreMenuRef}
                  className="absolute left-1/2 transform -translate-x-1/2 p-6 bg-white shadow-xl rounded-2xl w-[36rem] z-100 border border-gray-200 transition-all duration-600"
                >
                  <h3 className="text-gray-800 text-lg font-semibold mb-4 px-2">
                    Explore Categories
                  </h3>
                  <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto custom-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        className={`text-left px-4 py-2 bg-gray-100 rounded-lg hover:bg-blue-100 hover:shadow transition text-sm font-medium text-gray-700 border border-gray-200 ${
                          selectedCategory?._id === cat._id ? "bg-blue-200" : ""
                        }`}
                        onClick={() => handleCategorySelect(cat)}
                      >
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>

            <li>
            <button
  onClick={() => {
    if (user?.role !== 'publisher') {
      navigate("/apply-publisher");
    } else {
      toast.error('You are already a publisher');
    }
  }}
  
  className="px-4 py-2 bg-yellow-400 text-white rounded-full text-sm font-semibold shadow hover:bg-yellow-400 transition sm:min-w-32 md:min-w-40 lg:py-3 lg:max-w-24"
>
  Apply as Publisher
</button>

            </li>
          </ul>
        </div>

        {/* Right - Profile */}
        <div className="hidden md:flex items-center gap-4 relative">
          {isLogin ? (
            <div className="relative" ref={profileRef}>
              <img
                src={user?.avatar || defaultAvatar}
                alt="Profile"
                className="w-9 h-9 rounded-full border-2 border-white shadow cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
              />
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 z-50 overflow-hidden border border-gray-200 animate-fadeIn">
                  <ul className="flex flex-col">
                    <li>
                      <button
                        onClick={() => {
                          navigate(`/user/${user._id}`);
                          setProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-all font-medium"
                      >
                        Profile
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-all font-medium border-t"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <SparkButton className="font-semibold transition-all">
              <Link
                to="/login"
                className="flex items-center gap-2 font-medium p-1.5 mx-2"
              >
                <span>Login</span>
                <LogIn size={16} className="text-gray-600" />
              </Link>
            </SparkButton>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden relative">
          <button onClick={toggleMobileMenu} className="focus:outline-none">
            <Menu size={52} className="text-white" />
          </button>
          {isMobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="absolute -right-6 mt-4 w-72 bg-white border border-gray-200 text-blue-900 rounded-2xl shadow-2xl z-50 p-5 animate-slide-down space-y-5"
            >
              <div className="space-y-2">
                {navItems.map(({ to, label, icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-blue-100 hover:scale-[1.02] active:scale-100 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    {icon}
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Explore Mobile */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <button
                  onClick={() => setMobileExploreOpen((prev) => !prev)}
                  className="flex items-center justify-between w-full px-4 py-2 hover:bg-blue-100 rounded-lg transition text-sm font-semibold"
                >
                  <span>Explore Categories</span>
                  <ChevronDown
                    size={18}
                    className={`transform transition-transform duration-200 ${
                      isMobileExploreOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isMobileExploreOpen && (
                  <div className="pl-3 pr-2 max-h-52 overflow-y-auto custom-scrollbar space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => {
                          handleCategorySelect(cat);
                          setMobileMenuOpen(false);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                          selectedCategory?._id === cat._id
                            ? "bg-blue-200 text-blue-800 font-semibold"
                            : "hover:bg-blue-100"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Apply */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => {
                    navigate("/apply-publisher");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-white font-semibold py-2 px-4 rounded-full text-sm shadow-md transition-all duration-200"
                >
                  Apply for Publisher
                </button>
              </div>

              {/* Auth */}
              <div className="border-t border-gray-200 pt-4">
                {isLogin ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg text-sm transition"
                  >
                    Logout
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-100 rounded-lg text-sm transition"
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                  </NavLink>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
