import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';

const EditPost = ({ post, onClose, onUpdate }) => {
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    if (post) {
      setEditForm({
        title: post.title || '',
        description: post.description || ''
      });
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        title: editForm.title.trim(),
        description: editForm.description.trim()
      };

      if (!updateData.title || !updateData.description) {
        alert('Title and description are required');
        return;
      }

      if (!post?.postId) {
        throw new Error('Invalid post ID');
      }

      console.log('Updating post with ID:', post.postId);
      console.log('Update data:', updateData);

      const response = await api.put(`/api/posts/by-id/${post.postId}`, updateData);
      
      if (response?.data) {
        console.log('Update successful:', response.data);
        onUpdate();
        onClose();
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
        alert(`Error: ${err.response.data.message || 'Failed to update post'}`);
      } else {
        alert('Failed to update post. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-xl w-full p-4 relative">
        <h2 className="text-lg font-bold mb-4">Edit Post</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Title"
            />
          </div>
          <div>
            <textarea
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows="3"
              placeholder="Description"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
