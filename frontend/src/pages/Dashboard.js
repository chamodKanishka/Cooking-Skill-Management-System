import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import ProfileCompletion from '../components/ProfileCompletion';
import { FiLogOut, FiHome, FiCompass, FiBook, FiBell, FiUser, FiPlus } from 'react-icons/fi';
import CreatePost from '../components/posts/CreatePost';
import PostList from '../components/posts/PostList';
import Profile from '../pages/Profile';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (!parsedUser.fullName) {
      setShowProfileCompletion(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setShowProfileCompletion(false);
  };

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/dashboard' },
    { icon: FiCompass, label: 'Search', path: '/dashboard/explore' },
    { icon: FiBook, label: 'Learning Plans', path: '/dashboard/learning-plans' },
    { icon: FiBell, label: 'Notifications', path: '/dashboard/notifications' },
  ];

  if (!user) return null;
  return (    <div className="h-screen overflow-hidden bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400 flex transition-all duration-500">
      {/* Navigation Sidebar */}      
      <div className="w-64 bg-white/90 backdrop-blur-sm h-full shadow-xl flex flex-col border-r border-orange-100 transition-all duration-300 hover:shadow-2xl">        
        <div className="p-6 relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-black relative group cursor-pointer">
              <span className="inline-flex items-center">
                <svg className="w-9 h-9 mr-3 text-orange-500 transform rotate-12 group-hover:rotate-45 transition-all duration-300 hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent drop-shadow group-hover:drop-shadow-lg transition-all duration-300">
                  Cooksphere
                </span>
              </span>
            </h1>
            <div className="h-0.5 w-full bg-gradient-to-r from-orange-400 to-transparent mt-2 transform origin-left scale-x-0 group-hover:scale-x-100 transition-all duration-300 group-hover:glow-orange-500"></div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
        </div>
        
        {/* Navigation Items */}        <nav className="flex-1 px-4 py-2 space-y-2">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-md ${
                activeNav === label.toLowerCase()
                  ? 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:bg-orange-50/80 hover:text-orange-600'
              }`}
              onClick={() => setActiveNav(label.toLowerCase())}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${activeNav === label.toLowerCase() ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}          {/* Single Create Button */}
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-300 w-full transform hover:scale-105 hover:shadow-md bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium ${showCreateMenu ? 'shadow-lg scale-105' : ''}`}
            onClick={() => setShowCreateMenu((prev) => !prev)}
          >
            <FiPlus className="w-5 h-5 transition-transform duration-300" />
            <span>Create</span>
          </button>
          {/* Dropdown for Create Options */}
          {showCreateMenu && (
            <div className="ml-8 mt-1 bg-white/90 backdrop-blur-sm border border-orange-100 rounded-xl shadow-xl z-10 absolute transform transition-all duration-300 animate-fadeIn p-0">
              <button
                className="block w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors duration-200 rounded-t-xl font-medium text-gray-700 hover:text-orange-600 flex items-center gap-2"
                style={{ listStyle: 'none' }}
                onClick={() => { setShowCreateMenu(false); navigate('/dashboard/create'); }}
              >
                Create Post
              </button>
              <button
                className="block w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors duration-200 rounded-b-xl font-medium text-gray-700 hover:text-orange-600 flex items-center gap-2"
                style={{ listStyle: 'none' }}
                onClick={() => { setShowCreateMenu(false); navigate('/dashboard/learning-plan-create'); }}
              >
                Create Cooking Plan
              </button>
            </div>
          )}
        </nav>        {/* Profile and Logout Section */}
        <div className="p-4 border-t border-orange-100">
          <Link
            to="/dashboard/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transform transition-all duration-300 hover:scale-105 hover:shadow-md ${
              activeNav === 'profile'
                ? 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 shadow-sm'
                : 'text-gray-600 hover:bg-orange-50/80 hover:text-orange-600'
            }`}
            onClick={() => setActiveNav('profile')}
          >
            <FiUser className={`w-5 h-5 transition-transform duration-300 ${activeNav === 'profile' ? 'scale-110' : ''}`} />
            <span className="font-medium">My Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-red-600 hover:bg-red-50/80 transition-all duration-300 transform hover:scale-105 hover:shadow-md font-medium"
          >
            <FiLogOut className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
            <span>Logout</span>
          </button>
        </div>
      </div>      {/* Main Content Area */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FAF3E0] scrollbar-track-transparent hover:scrollbar-thumb-[#F5E6C9]">
          <div className="max-w-7xl mx-auto p-6 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {showProfileCompletion && (
        <ProfileCompletion
          user={user}
          onClose={() => setShowProfileCompletion(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

export default Dashboard;
