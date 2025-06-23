import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiUser, FiLogOut, FiLogIn } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './Header.css';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy thông tin người dùng từ Redux store
  const { user, token } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  // Hiệu ứng sticky header khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng search và dropdown khi click bên ngoài
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Tạo avatar từ tên người dùng
  const getUserInitials = () => {
    if (!user) return '';
    const fullName = user.profile?.fullName || user.username || '';
    const names = fullName.split(' ');
    return names
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
            aria-label="Search"
          >
            <FiSearch size={20} />
          </button>

          {/* Search Input */}
          <form
            ref={searchRef}
            className={`search-container ${searchOpen ? 'open' : ''}`}
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search courses, instructors..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit" aria-label="Submit search">
              <FiSearch size={18} />
            </button>
          </form>

          {/* User Actions */}
          <div className="user-actions" ref={userDropdownRef}>
            {isAuthenticated ? (
              <>
                <button
                  className="user-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User menu"
                >
                  <div className="user-avatar-sm">{getUserInitials()}</div>
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown">
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1.2rem',
                      background: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '1rem',
                        marginRight: '0.8rem'
                      }}>{getUserInitials()}</div>
                      <div>
                        <div>{user?.profile?.fullName || user?.username}</div>
                        <div>{user?.email}</div>
                      </div>
                    </div>

                    <ul className="dropdown-links">
                      <li>
                        <Link
                          to={user?.role === 'admin' ? '/admin' : user?.role === 'student' ? '/student' : user?.role === 'parent' ? '/parent/dashboard' : '/dashboard'}
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <FaChalkboardTeacher className="dropdown-icon" />
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link to="/profile" className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                          <FiUser className="dropdown-icon" />
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link to="/settings" className="dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                          <FiUser className="dropdown-icon" />
                          Account Settings
                        </Link>
                      </li>
                      <li className="dropdown-divider"></li>
                      <li>
                        <button className="dropdown-link" onClick={handleLogout}>
                          <FiLogOut className="dropdown-icon" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="btn-login"
                >
                  <FiLogIn className="me-2" /> Sign In
                </Link>
                <Link to="/signup" className="btn-signup">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mobile menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
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

            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to={user?.role === 'admin' ? '/admin' : user?.role === 'student' ? '/student' : user?.role === 'parent' ? '/parent/dashboard' : '/dashboard'}
                    className={`mobile-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    className="mobile-nav-btn mobile-nav-logout"
                    onClick={handleLogout}
                  >
                    <FiLogOut className="me-2" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="mobile-nav-btn mobile-nav-login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiLogIn className="me-2" /> Login
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
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Header;