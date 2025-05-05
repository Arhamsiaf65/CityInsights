import React, { useState } from 'react';
import { HiLocationMarker, HiMail, HiPhone, HiClock } from 'react-icons/hi';
import { userContext } from '../context/userContext';
import { useContext } from 'react';

function Contact() {
  const { contact } = useContext(userContext);

  // States for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (name && email && message) {
      // Call the contact function passed via context
      const success = await contact(name, email, message);
      if (success) {
        // Clear form after submission if needed
        setName('');
        setEmail('');
        setMessage('');
      }
    } else {
      // You can show a toast or alert if fields are empty
      console.log("Please fill all the fields");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100 px-4 py-12">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 bg-white shadow-xl rounded-3xl p-4 sm:p-8 md:p-16 border border-gray-100">
  
      {/* Contact Info */}
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900">
          Get in Touch
        </h1>
        <p className="text-base sm:text-lg text-gray-700">
          Have a story, feedback, or just want to say hi? Reach out to the City Insight team.
        </p>
  
        <div className="space-y-6 text-gray-700 text-sm sm:text-base">
          <div className="flex items-start gap-3">
            <HiLocationMarker className="text-yellow-400 text-xl sm:text-2xl mt-1" />
            <div>
              <h2 className="font-semibold text-yellow-400">Office Address</h2>
              <p>2nd Floor, Media Hub Plaza, Sahiwal, Punjab, Pakistan</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <HiMail className="text-yellow-400 text-xl sm:text-2xl mt-1" />
            <div>
              <h2 className="font-semibold text-yellow-400">Email</h2>
              <p>editor@cityinsight.pk</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <HiPhone className="text-yellow-400 text-xl sm:text-2xl mt-1" />
            <div>
              <h2 className="font-semibold text-yellow-400">Phone</h2>
              <p>+92 301 1234567</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <HiClock className="text-yellow-400 text-xl sm:text-2xl mt-1" />
            <div>
              <h2 className="font-semibold text-yellow-400">Office Hours</h2>
              <p>Mon - Fri: 9am – 5pm</p>
            </div>
          </div>
        </div>
      </div>
  
      {/* Contact Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-50 p-4 sm:p-6 rounded-2xl shadow-inner border border-gray-200"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ayesha Khan"
            className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
            Your Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            placeholder="Your message..."
            className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-700 to-purple-600 text-white py-2 sm:py-3 rounded-md font-semibold hover:opacity-90 transition-all shadow-md"
        >
          Send Message
        </button>
      </form>
    </div>
  </div>
  
  );
}

export default Contact;
