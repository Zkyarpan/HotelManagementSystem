import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center -mx-5 -my-2">
          <div className="px-5 py-2">
            <Link
              to="/"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Home
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/dashboard"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Dashboard
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/rooms"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Rooms
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/bookings"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Bookings
            </Link>
          </div>
        </nav>

        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {currentYear} Hotel Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
