import React, { useState } from 'react';
import { FiX, FiUpload, FiUser } from 'react-icons/fi';
import api from '../services/axiosConfig';

const ProfileCompletion = ({ user, onClose, onUpdate }) => {    const [formData, setFormData] = useState({
        id: user.id,
        fullName: user.fullName || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
    });
    const [previewUrl, setPreviewUrl] = useState(user.profilePicture || '');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image file is too large. Maximum size is 5MB');
                return;
            }
            
            try {
                // Convert image to base64
                const base64 = await convertToBase64(file);
                setFormData({ ...formData, profilePicture: base64 });
                setPreviewUrl(base64);
            } catch (err) {
                setError('Error processing image');
            }
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/auth/update-profile', formData);
            if (response.data) {
                // Update local storage as well
                const userData = localStorage.getItem('user');
                if (userData) {
                    const currentUser = JSON.parse(userData);
                    const updatedUser = { ...currentUser, ...response.data };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
                onUpdate(response.data);
                onClose();
            }
        }catch (err) {
            const errorMessage = err.response?.data?.message || 
                               err.response?.data || 
                               'Failed to update profile';
            setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        }
    };

    return (        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto py-8">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 my-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Profile</h2>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="relative w-32 h-32 mb-4">                            {previewUrl ? (
                                <img
                                    src={previewUrl.startsWith('data:') ? previewUrl : `http://localhost:8080${previewUrl}`}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
                                />
                            ) : (                                    <div className="w-32 h-32 rounded-full bg-[#FAF3E0] flex items-center justify-center border-4 border-[#F5E6C9]">
                                    <FiUser size={48} className="text-gray-800" />
                                </div>
                            )}                            <label className="absolute bottom-0 right-0 bg-[#FAF3E0] rounded-full p-2 cursor-pointer hover:bg-[#F5E6C9] transition-colors">
                                <FiUpload className="text-gray-800" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            disabled
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name*
                        </label>
                        <input
                            type="text"                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FAF3E0] focus:ring-1 focus:ring-[#FAF3E0]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <textarea                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FAF3E0] focus:ring-1 focus:ring-[#FAF3E0]"
                            placeholder="Tell us about yourself..."
                        />
                    </div>                    <div className="space-y-4">
                        <button
                            type="submit"
                            className="w-full bg-[#FAF3E0] text-gray-800 py-3 rounded-lg font-semibold hover:bg-[#F5E6C9] transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                        >
                            Complete Profile
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full border-2 border-[#FAF3E0] text-gray-800 py-3 rounded-lg font-semibold hover:bg-[#F5E6C9] transition duration-300"
                        >
                            Setup Later
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileCompletion;
