import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CommentModal = ({ isOpen, onClose, itemId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, itemId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/comments/${itemId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/api/comments/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'john',
          content: newComment
        })
      });
      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg w-full max-w-md p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="max-h-96 overflow-y-auto mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-sm text-gray-700">{comment.userId}</p>
              <p className="text-gray-600">{comment.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Post
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default CommentModal;
