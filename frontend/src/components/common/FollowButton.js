import React, { useState, useEffect } from 'react';

const FollowButton = ({ targetUserId, currentUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [targetUserId, currentUserId]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/follow/check/${currentUserId}/${targetUserId}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(
        `http://localhost:8080/api/follow/${currentUserId}/${targetUserId}`,
        {
          method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const buttonStyle = isFollowing
    ? isHovering
      ? 'bg-red-50 text-red-600 border-2 border-red-600'
      : 'bg-white text-black border-2 border-black'
    : 'bg-blue-500 text-white hover:bg-blue-600';

  const buttonText = isFollowing
    ? isHovering 
      ? 'Unfollow'
      : 'Following'
    : 'Follow';

  return (
    <button
      onClick={handleFollowToggle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${buttonStyle}`}
    >
      {buttonText}
    </button>
  );
};

export default FollowButton;
