import React, { useState, useEffect } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { ChatBubbleOvalLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const SocialInteractionBar = ({ itemId, userId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [userDetails, setUserDetails] = useState({});

  const modalStyles = {
    content: {
      position: 'relative',
      background: 'none',
      border: 'none',
      padding: 0,
      margin: 0,
      inset: 'auto'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }
  };

  const handleCloseModal = () => {
    setShowComments(false);
    setEditingComment(null);
    setEditContent('');
  };

  const fetchUserDetails = async (userId) => {
    if (userDetails[userId]) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const userData = await response.json();
      setUserDetails(prev => ({
        ...prev,
        [userId]: {
          username: userData.username,
          fullName: userData.fullName,
          profilePicture: userData.profilePicture
        }
      }));
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };  const handleLike = async () => {
    try {
      const requestData = {
        postId: String(itemId),  // Using postId instead of itemId to match backend
        userId: String(userId)
      };
      console.log('Like request data:', requestData);

      const response = await fetch(
        isLiked 
          ? `http://localhost:8080/api/likes/by-post/${requestData.postId}/user/${requestData.userId}` 
          : 'http://localhost:8080/api/likes',
        {
          method: isLiked ? 'DELETE' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          ...(isLiked ? {} : {
            body: JSON.stringify(requestData)
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    }
  };
  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/comments/${itemId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const text = await response.text();
      console.log('Comments response:', text);

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${text}`);
      }

      const data = JSON.parse(text);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/comments/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          content: newComment
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedComment = await response.json();
      setNewComment('');
      setComments(prevComments => [...prevComments, savedComment]);
      fetchUserDetails(userId);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  };

  const handleEditComment = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent
        })
      });

      if (!response.ok) throw new Error('Failed to update comment');

      const updatedComment = await response.json();
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === editingComment.id ? updatedComment : comment
        )
      );
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) throw new Error('Failed to delete comment');

        setComments(prevComments =>
          prevComments.filter(comment => comment.id !== commentId)
        );
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
      }
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [likesCountResponse, userLikeResponse, commentsResponse] = await Promise.all([
          fetch(`http://localhost:8080/api/likes/count-by-post/${itemId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          fetch(`http://localhost:8080/api/likes/by-post/${itemId}/user/${userId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          fetch(`http://localhost:8080/api/comments/${itemId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (likesCountResponse.ok) {
          const count = await likesCountResponse.json();
          setLikeCount(count);
        }

        if (userLikeResponse.ok) {
          const hasLiked = await userLikeResponse.json();
          setIsLiked(hasLiked);
        }

        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, [itemId, userId]);

  useEffect(() => {
    comments.forEach(comment => {
      if (!userDetails[comment.userId]) {
        fetchUserDetails(comment.userId);
      }
    });
  }, [comments]);

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLike}
            className="flex items-center space-x-1 group"
          >
            {isLiked ? (
              <HeartSolid className="h-6 w-6 text-red-500 transition-transform group-hover:scale-110" />
            ) : (
              <HeartOutline className="h-6 w-6 text-gray-500 transition-transform group-hover:scale-110" />
            )}
            <span className="text-sm text-gray-600">{likeCount}</span>
          </button>

          <button 
            onClick={() => setShowComments(true)}
            className="flex items-center space-x-1 group"
          >
            <ChatBubbleOvalLeftIcon className="h-6 w-6 text-gray-500 transition-transform group-hover:scale-110" />
            <span className="text-sm text-gray-600">{comments.length}</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={showComments}
        onRequestClose={handleCloseModal}
        style={modalStyles}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
      >
        <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
          <div className="max-h-96 overflow-y-auto mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                {editingComment?.id === comment.id ? (
                  <form onSubmit={handleEditComment} className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FAF3E0]"
                    />
                    <div className="flex gap-2">                      <button
                        type="submit"
                        className="px-3 py-1 bg-[#FAF3E0] text-gray-800 rounded-lg hover:bg-[#F5E6C9]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingComment(null);
                          setEditContent('');
                        }}
                        className="px-3 py-1 bg-[#FAF3E0] text-gray-800 rounded-lg hover:bg-[#F5E6C9]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {userDetails[comment.userId]?.profilePicture ? (
                        <img
                          src={userDetails[comment.userId].profilePicture.startsWith('data:') 
                            ? userDetails[comment.userId].profilePicture 
                            : `http://localhost:8080${userDetails[comment.userId].profilePicture}`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-orange-500">
                            {userDetails[comment.userId]?.username?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm">
                            {userDetails[comment.userId]?.fullName || userDetails[comment.userId]?.username || 'Unknown User'}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">@{userDetails[comment.userId]?.username}</span>
                        </div>
                        {comment.userId === userId && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingComment(comment);
                                setEditContent(comment.content);
                              }}
                              className="p-1 text-blue-500 hover:text-blue-700"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FAF3E0]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#FAF3E0] text-gray-800 rounded-lg hover:bg-[#F5E6C9] transition-colors"
            >
              Post
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default SocialInteractionBar;
