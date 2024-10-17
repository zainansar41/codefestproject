import React, { useState, useEffect, useRef } from 'react';
import {
  FiHome,
  FiFile,
  FiFolder,
  FiMessageCircle,
  FiUsers,
  FiSettings,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Navbar = () => {
  // State variables for dropdowns and mobile menu
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu
  const [pagesOpen, setPagesOpen] = useState(false); // Pages dropdown
  const [usersOpen, setUsersOpen] = useState(false); // Users dropdown
  const [profileOpen, setProfileOpen] = useState(false); // Profile menu

  // Refs for detecting clicks outside of dropdowns
  const pagesRef = useRef();
  const usersRef = useRef();
  const profileRef = useRef();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pagesRef.current && !pagesRef.current.contains(event.target)) {
        setPagesOpen(false);
      }
      if (usersRef.current && !usersRef.current.contains(event.target)) {
        setUsersOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close all menus on Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setPagesOpen(false);
        setUsersOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="antialiased bg-white">
      <nav className="bg-gray-800">
        <div className="container px-6 mx-auto lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center justify-between flex-grow">
              <div className="flex-shrink-0">
                <h1 className="text-lg font-semibold tracking-widest text-white uppercase">
                  <a href="#">Administration</a>
                </h1>
              </div>
              {/* Desktop menu */}
              <div className="hidden lg:block">
                <div className="flex items-center">
                  {/* Dashboard link */}
                  <a
                    href="#"
                    className="flex flex-row items-center px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md focus:outline-none focus:text-white focus:bg-gray-700"
                  >
                    <FiHome className="w-4 h-4" />
                    <span className="ml-2">Dashboard</span>
                  </a>
                  {/* Posts link */}
                  <Link
                   to={'/workspace'}
                    className="flex flex-row items-center px-3 py-2 ml-4 text-sm font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                  >
                    <FiFile className="w-4 h-4" />
                    <span className="ml-2">Workspace</span>
                  </Link>
                  {/* Comments link */}
                  <a
                    href="#"
                    className="flex flex-row items-center px-3 py-2 ml-4 text-sm font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span className="ml-2">Comments</span>
                  </a>
                  {/* Settings link */}
                  <a
                    href="#"
                    className="flex flex-row items-center px-3 py-2 ml-4 text-sm font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                  >
                    <FiSettings className="w-4 h-4" />
                    <span className="ml-2">Settings</span>
                  </a>
                </div>
              </div>
            </div>
            {/* Profile dropdown */}
            <div className="hidden lg:block">
              <div className="flex items-center ml-4 md:ml-6">
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center max-w-xs text-sm text-white rounded-full focus:outline-none focus:shadow-solid"
                    aria-label="User menu"
                    aria-haspopup="true"
                  >
                    <img
                      className="w-8 h-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                      alt=""
                    />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 w-48 mt-2 origin-top-right rounded-md shadow-lg">
                      <div className="py-1 bg-white rounded-md shadow-xs">
                        <a
                          href="#"
                          className="flex flex-row items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none hover:bg-gray-100 focus:bg-gray-100"
                        >
                          <FiUser className="w-4 h-4" />
                          <span className="ml-2">Your Profile</span>
                        </a>
                        <a
                          href="#"
                          className="flex flex-row items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none hover:bg-gray-100 focus:bg-gray-100"
                        >
                          <FiSettings className="w-4 h-4" />
                          <span className="ml-2">Settings</span>
                        </a>
                        <a
                          href="#"
                          className="flex flex-row items-center px-4 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-100 focus:outline-none focus:text-red-700 focus:bg-red-100"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span className="ml-2">Sign out</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="flex -mr-2 lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
                aria-label={menuOpen ? 'Close main menu' : 'Main menu'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden">
            <div className="container px-6 mx-auto">
              <div className="pt-2 pb-3">
                {/* Dashboard link */}
                <a
                  href="#"
                  className="flex flex-row items-center px-3 py-2 text-base font-medium text-white bg-gray-900 rounded-md focus:outline-none focus:text-white focus:bg-gray-700"
                >
                  <FiHome className="w-4 h-4" />
                  <span className="ml-2">Dashboard</span>
                </a>
                {/* Posts link */}
                <a
                  href="#"
                  className="flex flex-row items-center px-3 py-2 mt-1 text-base font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                >
                  <FiFile className="w-4 h-4" />
                  <span className="ml-2">Posts</span>
                </a>
                {/* Pages dropdown */}
                <div className="relative" ref={pagesRef}>
                  <button
                    onClick={() => setPagesOpen(!pagesOpen)}
                    className="flex flex-row items-center w-full px-3 py-2 mt-1 text-base font-medium text-left text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                  >
                    <FiFolder className="w-4 h-4" />
                    <span className="mx-2">Pages</span>
                    <FiChevronDown
                      className={`w-4 h-4 mt-1 transform ${
                        pagesOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                  {pagesOpen && (
                    <div className="px-2 py-2 mt-2 bg-white rounded-md shadow-xs">
                      <a
                        href="#"
                        className="flex flex-row items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:text-gray-900 focus:bg-gray-200"
                      >
                        Pages-1
                      </a>
                      <a
                        href="#"
                        className="flex flex-row items-center px-3 py-2 mt-1 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:text-gray-900 focus:bg-gray-200"
                      >
                        Pages-2
                      </a>
                      <a
                        href="#"
                        className="flex flex-row items-center px-3 py-2 mt-1 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:text-gray-900 focus:bg-gray-200"
                      >
                        Pages-3
                      </a>
                    </div>
                  )}
                </div>
                {/* Comments link */}
                <a
                  href="#"
                  className="flex flex-row items-center px-3 py-2 mt-1 text-base font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  <span className="ml-2">Comments</span>
                </a>
                {/* Users dropdown */}
                <div className="relative" ref={usersRef}>
                  <button
                    onClick={() => setUsersOpen(!usersOpen)}
                    className="flex flex-row items-center w-full px-3 py-2 mt-1 text-base font-medium text-left text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                  >
                    <FiUsers className="w-4 h-4" />
                    <span className="mx-2">Users</span>
                    <FiChevronDown
                      className={`w-4 h-4 mt-1 transform ${
                        usersOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                  {usersOpen && (
                    <div className="px-2 py-2 mt-2 bg-white rounded-md shadow-xs">
                      <a
                        href="#"
                        className="flex flex-row items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:text-gray-900 focus:bg-gray-200"
                      >
                        Users-1
                      </a>
                      <a
                        href="#"
                        className="flex flex-row items-center px-3 py-2 mt-1 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:text-gray-900 focus:bg-gray-200"
                      >
                        Users-2
                      </a>
                      <a
                        href="#"
                        className="flex flex-row items-center px-3 py-2 mt-1 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:text-gray-900 focus:bg-gray-200"
                      >
                        Users-3
                      </a>
                    </div>
                  )}
                </div>
                {/* Settings link */}
                <a
                  href="#"
                  className="flex flex-row items-center px-3 py-2 mt-1 text-base font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                >
                  <FiSettings className="w-4 h-4" />
                  <span className="ml-2">Settings</span>
                </a>
              </div>
            </div>
            {/* Mobile profile dropdown */}
            <div className="container px-6 mx-auto">
              <div className="py-4 border-t border-gray-700">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center w-full focus:outline-none"
                >
                  <div className="flex items-center w-full text-left">
                    <div className="flex-shrink-0">
                      <img
                        className="w-10 h-10 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        Tom Cook
                      </div>
                      <div className="mt-1 text-sm font-medium leading-none text-gray-400">
                        tom@example.com
                      </div>
                    </div>
                  </div>
                  <div className="text-white">
                    <FiChevronDown
                      className={`w-4 h-4 mt-1 transform ${
                        profileOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </div>
                </button>
                {profileOpen && (
                  <div className="py-2 mt-4 bg-white rounded-md shadow-xs">
                    <a
                      href="#"
                      className="flex flex-row items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:text-gray-900 focus:bg-gray-200"
                    >
                      <FiUser className="w-4 h-4" />
                      <span className="ml-2">Your Profile</span>
                    </a>
                    <a
                      href="#"
                      className="flex flex-row items-center px-3 py-2 mt-1 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:text-gray-900 focus:bg-gray-200"
                    >
                      <FiSettings className="w-4 h-4" />
                      <span className="ml-2">Settings</span>
                    </a>
                    <a
                      href="#"
                      className="flex flex-row items-center px-3 py-2 mt-1 text-base font-medium text-red-500 rounded-md hover:text-red-700 hover:bg-red-200 focus:outline-none focus:text-red-700 focus:bg-red-200"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span className="ml-2">Sign out</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
