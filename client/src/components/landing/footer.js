import React ,{useState} from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FiArrowUp , FiMessageSquare} from 'react-icons/fi';
import Chatbot from './chatbot'; 

const Footer = () => {
  const [showChat, setShowChat] = useState(false);
  return (
    <footer className="footer-class text-gray-600 mt-5">
         {/* Chatbot Toggle Arrow on Left */}
         <div className="fixed bottom-4 left-4">
        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-[#ff6b00] text-white p-3 rounded-full flex items-center justify-center shadow-lg hover:bg-[#e65a00] transition-all"
        >
          <FiMessageSquare className="text-2xl" />
        </button>
      </div>
      {showChat && (
        <div className="fixed bottom-20 left-4 w-80 z-50">
          <Chatbot />
        </div>
      )}
      {/* Back to Top */}
      <div className="fixed bottom-4 right-4">
        <a
          href="#top"
          className="bg-[#ff6b00] text-white p-3 rounded-full flex items-center justify-center shadow-lg hover:bg-[#e65a00] transition-all"
        >
          <FiArrowUp className="text-2xl" />
        </a>
      </div>

      {/* Footer Links */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-sm">
        {/* Get to Know Us */}
        <div>
          <h3 className="font-bold text-lg mb-4">Get to Know Us</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Press Releases</a></li>
            <li><a href="#" className="hover:underline">Our Services</a></li>
          </ul>
        </div>

        {/* Make Money with Us */}
        <div>
          <h3 className="font-bold text-lg mb-4">Make Money with Us</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Sell on Our Platform</a></li>
            <li><a href="#" className="hover:underline">Affiliate Program</a></li>
            <li><a href="#" className="hover:underline">Advertise Your Products</a></li>
            <li><a href="#" className="hover:underline">Become a Partner</a></li>
          </ul>
        </div>

        {/* Let Us Help You */}
        <div>
          <h3 className="font-bold text-lg mb-4">Let Us Help You</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Customer Service</a></li>
            <li><a href="#" className="hover:underline">Shipping Information</a></li>
            <li><a href="#" className="hover:underline">Returns & Refunds</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
          </ul>
        </div>

        {/* Connect with Us */}
        <div>
          <h3 className="font-bold text-lg mb-4">Connect with Us</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline flex items-center">
                <FaFacebook className="mr-2" /> Facebook
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline flex items-center">
                <FaTwitter className="mr-2" /> Twitter
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline flex items-center">
                <FaInstagram className="mr-2" /> Instagram
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline flex items-center">
                <FaLinkedin className="mr-2" /> LinkedIn
              </a>
            </li>
          </ul>
        </div>

        {/* Language Selector */}
        <div>
          <h3 className="font-bold text-lg mb-4">Language</h3>
          <select className="bg-[#ff6b00] text-white p-2 rounded w-full">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <a href="/" className="text-xl font-bold">YourCompany</a>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Cookie Policy</a>
            <a href="#" className="hover:underline">Contact Us</a>
          </div>

          {/* Copyright */}
          <div className="mt-4 md:mt-0">
            <p>&copy; {new Date().getFullYear()} YourCompany. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;