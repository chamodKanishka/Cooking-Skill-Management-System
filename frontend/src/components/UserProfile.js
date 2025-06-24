import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import PostList from './posts/PostList';
import ProgressList from './ProgressList';
import api from '../services/axiosConfig';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user details
        const userResponse = await api.get(`/api/users/${userId}`);
        setUser(userResponse.data);

        // Fetch user's posts
        const postsResponse = await api.get(`/api/posts/user/${userId}`);
        setUserPosts(postsResponse.data);

        // Fetch user's progress
        const progressResponse = await api.get(`/api/progress/user/${userId}`);
        setUserProgress(progressResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.response?.data?.message || 'Error loading user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture.startsWith('data:') ? user.profilePicture : `http://localhost:8080${user.profilePicture}`}
                alt={user.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-4 border-orange-200">
                <FiUser size={48} className="text-orange-500" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>
              {user.bio && <p className="text-gray-700">{user.bio}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
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
              </div>
            ) : (
              <div className="overflow-hidden">
                <PostList posts={userPosts} />
              </div>
            )
          ) : (
            <div>
              {userProgress.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-600 text-lg">No learning progress yet</p>
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
  );
};

export default UserProfile;
