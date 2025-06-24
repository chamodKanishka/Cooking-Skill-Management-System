import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import EditPost from './EditPost';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import SocialInteractionBar from '../common/SocialInteractionBar';

const getRelativeTime = (date) => {
  if (!date) return 'Recently';
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

const PostList = ({ posts: initialPosts }) => {
  const [posts, setPosts] = useState(initialPosts || []);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [isLoading, setIsLoading] = useState(!initialPosts);
  const [loadingRetries, setLoadingRetries] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUserId(user.id);
    }
  }, []);

  useEffect(() => {
    setPosts(initialPosts || []);
  }, [initialPosts]);
  useEffect(() => {
    if (!initialPosts) fetchPosts();
  }, [initialPosts]);

  const fetchUserDetails = async (userId) => {
    if (userDetails[userId]) return; // Don't fetch if we already have the details
    
    try {
      const response = await api.get(`/api/users/${userId}`);
      if (response.data) {
        setUserDetails(prev => ({
          ...prev,
          [userId]: {
            username: response.data.username,
            fullName: response.data.fullName,
            profilePicture: response.data.profilePicture
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Fetch user details for each post
  useEffect(() => {
    posts.forEach(post => {
      if (post.userId) {
        fetchUserDetails(post.userId);
      }
    });
  }, [posts]);  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // If we have initialPosts (for profile view), use those
      if (initialPosts) {
        setPosts(initialPosts);
        return;
      }

      // For home page, always fetch all posts
      const response = await api.get('/api/posts');
      
      if (response.data) {
        setPosts(response.data);
        setLoadingRetries(0);
      } else {
        throw new Error('No data in response');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (loadingRetries < maxRetries) {
        const retryDelay = Math.min(1000 * Math.pow(2, loadingRetries), 10000);
        setTimeout(() => {
          setLoadingRetries(prev => prev + 1);
          fetchPosts();
        }, retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPost = (post) => {
    if (!post || !post.postId) {
      alert('Cannot edit this post at the moment');
      return;
    }
    setEditingPost(post);
  };

  const handleUpdatePost = async () => {
    await fetchPosts();
    setEditingPost(null);
  };

  const handleDeletePost = async (post) => {
    if (!post?.postId) return;
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/by-id/${post.postId}`);
        await fetchPosts();
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    const baseUrl = 'http://localhost:8080';
    try {
      if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http')) return url;
      return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
    } catch (error) {
      console.error('Error constructing image URL:', error);
      return '';
    }
  };

  const handleImageError = (e, url) => {
    e.target.onerror = null;
    e.target.src = 'data:image/svg+xml;base64,...'; // Placeholder image
  };

  const nextImage = (postId) => {
    setCurrentImageIndexes(prev => {
      const currentIndex = prev[postId] || 0;
      const post = posts.find(p => p.postId === postId);
      return {
        ...prev,
        [postId]: (currentIndex + 1) % (post?.mediaUrls?.length || 1)
      };
    });
  };

  const prevImage = (postId) => {
    setCurrentImageIndexes(prev => {
      const currentIndex = prev[postId] || 0;
      const post = posts.find(p => p.postId === postId);
      return {
        ...prev,
        [postId]: (currentIndex - 1 + post?.mediaUrls?.length) % post?.mediaUrls?.length
      };
    });
  };

  const getCurrentImageIndex = (postId) => currentImageIndexes[postId] || 0;

  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
          {loadingRetries > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Retrying... Attempt {loadingRetries} of {maxRetries}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {editingPost && (
        <div className="relative z-50">
          <EditPost post={editingPost} onClose={() => setEditingPost(null)} onUpdate={handleUpdatePost} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div key={post.postId.toString()} className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1">
            {/* User info header */}
            <div className="flex items-center gap-3 p-4 border-b min-h-[4.5rem]">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 flex-shrink-0">
                {userDetails[post.userId]?.profilePicture ? (
                  <img 
                    src={userDetails[post.userId].profilePicture.startsWith('data:') 
                      ? userDetails[post.userId].profilePicture 
                      : `http://localhost:8080${userDetails[post.userId].profilePicture}`}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg font-medium text-orange-500">
                      {userDetails[post.userId]?.username?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-grow overflow-hidden">
                <div className="font-semibold text-gray-900 truncate">
                  @{userDetails[post.userId]?.username}
                </div>
              </div>
            </div>

            {/* Header Buttons */}
            <div className="absolute top-14 right-2 z-10 flex gap-2">
              <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm ring-1 ring-white/10 shadow-lg opacity-75 group-hover:opacity-100 transition-opacity">
                {getRelativeTime(post.createdAt)}
              </span>
              {currentUserId && post.userId === currentUserId && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); handleEditPost(post); }} className="bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ring-1 ring-white/10 shadow-lg" title="Edit post">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post); }} className="bg-red-500/50 hover:bg-red-500/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ring-1 ring-white/10 shadow-lg" title="Delete post">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Post Media */}
            <div className="relative w-full" style={{ paddingBottom: '100%' }}>
              {post.mediaUrls && post.mediaUrls.length > 0 ? (
                <div className="absolute inset-0 bg-gray-100">
                  {post.mediaType === 'photo' ? (
                    <img
                      src={getImageUrl(post.mediaUrls[getCurrentImageIndex(post.postId)])}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-300 filter group-hover:brightness-105"
                      onError={(e) => handleImageError(e, post.mediaUrls[getCurrentImageIndex(post.postId)])}
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <video
                      src={getImageUrl(post.mediaUrls[getCurrentImageIndex(post.postId)])}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                  {post.mediaUrls.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); prevImage(post.postId); }} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100">←</button>
                      <button onClick={(e) => { e.stopPropagation(); nextImage(post.postId); }} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100">→</button>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        {getCurrentImageIndex(post.postId) + 1} / {post.mediaUrls.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex-grow bg-gradient-to-b from-white to-gray-50 transition-colors group-hover:from-white group-hover:to-orange-50/30">
              <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-orange-600 transition-all">{post.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4 group-hover:line-clamp-none transition-all duration-500 ease-in-out">{post.description}</p>
              <SocialInteractionBar itemId={post.postId.toString()} userId={currentUserId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;