import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useContext, useState } from "react";
import { CategoriesContext } from "../context/categoriesContext";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const translations = {
  en: {
    about: "City Insight is your community-powered platform for local stories, reviews, and connections. Join us to explore your city like never before.",
    contact: "Contact Us",
    categories: "Top Categories",
    links: "Quick Links",
    visionTitle: "Our Vision",
    vision: "City Insight empowers the Sahiwal community by providing a platform for local stories, trusted reviews, and meaningful connections. Discover what matters in your city.",
    home: "Home",
    aboutPage: "About",
    contactPage: "Contact",
    publisher: "Apply for Publisher",
    quickLinksDescription: "Stay informed with our most important links. Whether you're looking to learn about us, get in touch, or become a publisher—everything is just a click away.",
  },
  ur: {
    about: "سٹی انسائٹ آپ کا کمیونٹی پر مبنی پلیٹ فارم ہے جہاں مقامی کہانیاں، جائزے اور روابط دستیاب ہیں۔ ہمارے ساتھ اپنی شہر کو نئے انداز سے دریافت کریں۔",
    contact: "ہم سے رابطہ کریں",
    categories: "اہم اقسام",
    links: "فوری روابط",
    visionTitle: "ہمارا وژن",
    vision: "سٹی انسائٹ ساہیوال کی کمیونٹی کو طاقت دیتا ہے تاکہ مقامی کہانیاں، قابلِ اعتماد جائزے اور بامعنی روابط فراہم کیے جا سکیں۔ اپنے شہر میں اہم چیزیں دریافت کریں۔",
    home: "صفحۂ اول",
    aboutPage: "ہمارے بارے میں",
    contactPage: "رابطہ کریں",
    publisher: "پبلشر کے لیے درخواست دیں",
    quickLinksDescription: "ہماری سب سے اہم روابط سے باخبر رہیں۔ چاہے آپ ہمارے بارے میں جاننا چاہتے ہوں، رابطہ کرنا ہو، یا پبلشر بننا چاہتے ہوں—سب کچھ صرف ایک کلک کی دوری پر ہے۔",
  },
  pa: {
    about: "سٹی انسائٹ تھوڑا کمیونٹی-پاورڈ پلیٹفارم اے، جتھے تسی لوکل کہانیاں، ریویوز تے کنیکشنز لبھ سکدے او۔ ساڈے نال آپنا شہر نوّیں طریقے نال ویکھو۔",
    contact: "ساڈے نال رابطہ کرو",
    categories: "ٹاپ کیٹگریاں",
    links: "فوری لنکس",
    visionTitle: "ساڈی سوچ",
    vision: "سٹی انسائٹ ساہیوال دی عوام نوں طاقت دیندا اے کہ اوہناں دی کہانیاں، ریویوز تے تعلقات دنیا دے نال سانجھے کیتے جان۔ اپنے شہر دے خاص پہلو جانوں۔",
    home: "گھر",
    aboutPage: "ساڈے بارے",
    contactPage: "رابطہ کرو",
    publisher: "پبلشر لئی درخواست دو",
    quickLinksDescription: "ساڈیاں سب توں اہم لنکس نال باخبر رہو۔ جے تسی ساڈے بارے جاننا، رابطہ کرنا یا پبلشر بننا چاندے او—سب کج اک کلک تے دستیاب اے۔",
  },
};


export default function Footer() {
  const { categories } = useContext(CategoriesContext);
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  return (
    <footer className="bg-[#2F5191] text-white px-6 py-16 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:px-16 sm:grid-cols-3 md:grid-cols-4 gap-10">

        {/* About */}
        <div>
          <img src="/logo.png" alt="City Insight Logo" className="w-28 mb-4" />
          <p className="text-sm text-gray-300 leading-relaxed">{t.about}</p>
          <div className="mt-5 space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2"><Phone size={16} /> +92 300 1234567</div>
            <div className="flex items-center gap-2"><Mail size={16} /> support@cityinsight.pk</div>
            <div className="flex items-center gap-2"><MapPin size={16} /> Sahiwal, Pakistan</div>
          </div>
        </div>

         {/* Quick Links */}
<div className="flex flex-col gap-5">
  <div>
    <h3 className="text-lg font-semibold text-yellow-400 mb-4">{t.links}</h3>
    <ul className="space-y-2 text-sm text-gray-200">
      <li><Link to="/" className="hover:text-yellow-300 transition">{t.home}</Link></li>
      <li><Link to="/about" className="hover:text-yellow-300 transition">{t.aboutPage}</Link></li>
      <li><Link to="/contact" className="hover:text-yellow-300 transition">{t.contactPage}</Link></li>
      <li><Link to="/apply-publisher" className="hover:text-yellow-300 transition">{t.publisher}</Link></li>
    </ul>
  </div>

  {/* Additional Description Below Quick Links */}
  <div>
    <p className="text-sm text-gray-300 leading-relaxed">
      {t.quickLinksDescription}
    </p>
  </div>
</div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">{t.categories}</h3>
          <ul className="space-y-2 text-sm text-gray-200">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat._id}>
                <Link to={`/category/${cat.name}`} className="hover:text-yellow-300 transition">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      


        {/* Vision */}
        <div className="flex flex-col gap-10">
        <div>
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">{t.visionTitle}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{t.vision}</p>
        </div>


          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Follow Us On</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300 transition">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300 transition">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300 transition">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* social media icons */}
        {/* Social Media */}


      </div>

      {/* Language Switcher */}
      <div className="mt-10 flex justify-center">
        <select
          className="bg-[#24407A] cursor-pointer text-white px-4 py-2 rounded-md text-sm border border-gray-400"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ur">اردو</option>
          <option value="pa">پنجابی</option>
        </select>
      </div>

      {/* Bottom bar */}
      <div className="mt-6 border-t border-gray-500 pt-6 text-center text-sm text-gray-300">
        &copy; {new Date().getFullYear()} City Insight — Made with 💙 in Sahiwal.
      </div>
    </footer>
  );
}
