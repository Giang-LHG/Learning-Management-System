import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';
import './Header.css'; 
function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  // Hiệu ứng sticky header khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng search khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng menu khi nhấn Esc
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo-container">
          <Link to="/" className="logo">
            <span className="logo-gradient">Edu</span>LMS
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/courses" 
                className={`nav-link ${location.pathname === '/courses' ? 'active' : ''}`}
              >
                Courses
              </Link>
            </li>
            <li>
              <Link 
                to="/instructors" 
                className={`nav-link ${location.pathname === '/instructors' ? 'active' : ''}`}
              >
                Instructors
              </Link>
            </li>
            <li>
              <Link 
                to="/pricing" 
                className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}
              >
                Pricing
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          {/* Search Button */}
          <button 
            className="search-button"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <FiSearch size={20} />
          </button>
          
          {/* Search Input */}
          <div 
            ref={searchRef}
            className={`search-container ${searchOpen ? 'open' : ''}`}
          >
            <input 
              type="text" 
              placeholder="Search courses, instructors..." 
              className="search-input"
            />
            <button className="search-submit">
              <FiSearch size={18} />
            </button>
          </div>
          
          {/* User Actions */}
          <div className="user-actions" ref={userDropdownRef}>
            <button 
              className="user-button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <FiUser size={20} />
            </button>
            
            {userDropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="user-avatar">JD</div>
                  <div className="user-info">
                    <div className="user-name">John Doe</div>
                    <div className="user-email">john.doe@example.com</div>
                  </div>
                </div>
                
                <ul className="dropdown-links">
                  <li>
                    <Link to="/dashboard" className="dropdown-link">
                      <FaChalkboardTeacher className="dropdown-icon" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="dropdown-link">
                      <FiUser className="dropdown-icon" />
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="dropdown-link">
                      <FiUser className="dropdown-icon" />
                      Account Settings
                    </Link>
                  </li>
                  <li className="dropdown-divider"></li>
                  <li>
                    <Link to="/logout" className="dropdown-link">
                      <FiLogOut className="dropdown-icon" />
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            )}
            
            <Link to="/signup" className="btn-signup">
              Sign Up
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-container">
          <ul className="mobile-nav-links">
            <li>
              <Link 
                to="/" 
                className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/courses" 
                className={`mobile-nav-link ${location.pathname === '/courses' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
            </li>
            <li>
              <Link 
                to="/instructors" 
                className={`mobile-nav-link ${location.pathname === '/instructors' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Instructors
              </Link>
            </li>
            <li>
              <Link 
                to="/pricing" 
                className={`mobile-nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard" 
                className={`mobile-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/login" 
                className="mobile-nav-btn mobile-nav-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </li>
            <li>
              <Link 
                to="/signup" 
                className="mobile-nav-btn mobile-nav-signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Header;