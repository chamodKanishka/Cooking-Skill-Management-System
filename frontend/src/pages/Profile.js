import React, { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import PostList from '../components/posts/PostList';
import ProgressList from '../components/ProgressList';
import api from '../services/axiosConfig';

const Profile = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'posts');
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    profilePicture: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('User not logged in');
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData({
          fullName: parsedUser.fullName || '',
          bio: parsedUser.bio || '',
          profilePicture: parsedUser.profilePicture || ''
        });        setPreviewUrl(parsedUser.profilePicture || '');
        
        // Fetch user's posts and progress
        try {
          // Fetch posts
          const postsResponse = await api.get(`/api/posts/user/${parsedUser.id}`);
          setUserPosts(postsResponse.data);

          // Fetch progress
          const progressResponse = await api.get(`/api/progress/user/${parsedUser.id}`);
          setUserProgress(progressResponse.data);        } catch (fetchError) {
          console.error('Error fetching data:', fetchError);
          setUserPosts([]);
          setUserProgress([]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Maximum size is 5MB');
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        setFormData(prev => ({ ...prev, profilePicture: base64 }));
        setPreviewUrl(base64);
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Failed to process image');
      }
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/api/auth/update-profile', {
        id: user.id,
        ...formData
      });

      if (response.data) {
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditMode(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center text-red-600">Please log in to view your profile</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden">              {previewUrl ? (
                <img
                  src={previewUrl.startsWith('data:') ? previewUrl : `http://localhost:8080${previewUrl}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                  <span className="text-4xl text-orange-500">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 cursor-pointer hover:bg-orange-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <FiEdit className="text-white" />
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full">
            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, bio: e.target.value }))
                    }
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        fullName: user.fullName || '',
                        bio: user.bio || '',
                        profilePicture: user.profilePicture || ''
                      });
                      setPreviewUrl(user.profilePicture || '');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">                  <div>
                    <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-[#FAF3E0] text-gray-800 rounded-lg hover:bg-[#F5E6C9] transition-all transform hover:scale-105"
                  >
                    Edit Profile
                  </button>
                </div>
                {user.bio && <p className="text-gray-700">{user.bio}</p>}
              </div>
            )}
          </div>
        </div>      </div>
        {/* User's Posts Section */}      {/* Tabs Section */}
      <div className="mt-8">
        <div className="bg-gray-50 rounded-lg">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-4 px-1 relative font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'posts'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`py-4 px-1 relative font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'progress'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Learning Progress
                </button>
              </nav>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'posts' ? (
              userPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-600 text-lg">No posts yet</p>
                  <p className="text-gray-500 mt-2">Share your first cooking experience!</p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <PostList posts={userPosts} showActions={true} />
                </div>
              )
            ) : (
              <div>
                {userProgress.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600 text-lg">No learning progress yet</p>
                    <p className="text-gray-500 mt-2">Start your learning journey!</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <ProgressList progress={userProgress} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
