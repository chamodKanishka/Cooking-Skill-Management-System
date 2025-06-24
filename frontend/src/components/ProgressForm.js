import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/axiosConfig';

const ProgressForm = ({ onSubmit }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(() => location.state?.templateType || 'recipe');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    // Get logged in user from localStorage when component mounts
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userData);
        setLoggedInUserId(user.id);
    }, [navigate]);

    const categories = [
        {
            id: 'recipe',
            name: '📖 Completed a New Recipe',
            fields: {
                courseName: 'Course Name',
                title: 'Recipe Name',
                details: 'Additional Details (Optional)',
            },
        },
        {
            id: 'technique',
            name: '🔪 Mastered a New Technique',
            fields: {
                courseName: 'Course Name',
                title: 'Technique Name',
                details: 'Additional Details (Optional)',
            },
        },
        {
            id: 'ingredient',
            name: '🧂 Learned About an Ingredient',
            fields: {
                courseName: 'Course Name',
                title: 'Ingredient Name',
                details: 'Additional Details (Optional)',
            },
        },
    ];    const [formData, setFormData] = useState(() => {
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData).id : null;
        
        const initialState = {
            userId: userId,
            templateType: 'recipe',
            courseName: '',
            title: '',
            details: '',
        };

        // If there is state passed from learning plan, use it to pre-populate form
        if (location.state) {
            return {
                userId: userId, // Always use the logged-in user's ID
                templateType: location.state.templateType || initialState.templateType,
                courseName: location.state.courseName || initialState.courseName,
                title: location.state.title || initialState.title,
                details: location.state.details || initialState.details,
            };
        }

        return initialState;
    });    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.courseName.trim() || !formData.title.trim()) {
            setError('Course Name and Title are required');
            return;
        }

        if (!formData.userId) {
            setError('You must be logged in to submit progress');
            navigate('/login');
            return;
        }

        try {
            const submissionData = {
                ...formData,
                courseName: formData.courseName.trim(),
                title: formData.title.trim(),
                details: formData.details.trim() || '',
            };

            const response = await api.post(
                '/api/progress',
                submissionData
            );

            if (response.status === 200 && response.data) {
                onSubmit && onSubmit(response.data);
                clearForm();
                setShowSuccess(true);
                // Hide success message after 2 seconds and navigate
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate('/dashboard/progress-list');
                }, 2000);
            } else {
                setError(response.data || 'Failed to save progress');
            }
        } catch (error) {
            setError(error.response?.data || 'An unexpected error occurred');
        }
    };    const clearForm = () => {
        // Reset form data but preserve userId from state if it exists
        setFormData({
            userId: location.state?.userId || '1',
            templateType: 'recipe',
            courseName: '',
            title: '',
            details: '',
        });
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        // Implement your delete logic here
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl p-8 sm:p-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-800">
                        🍳 Share Your Culinary Progress
                    </h2>
                    <button
                        onClick={() => navigate('/dashboard/profile', { state: { activeTab: 'progress' } })}
                        className="px-4 py-2 bg-[#FAF3E0] text-gray-800 font-medium rounded-full hover:bg-[#F5E6C9] transition"
                    >
                        My Learnings
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setSelectedCategory(cat.id);
                                setFormData((prev) => ({
                                    ...prev,
                                    templateType: cat.id,
                                    courseName: '',
                                    title: '',
                                    details: '',
                                }));
                            }}                            className={`p-4 text-sm font-semibold rounded-2xl border transition shadow-sm ${
                                selectedCategory === cat.id
                                    ? 'bg-[#FAF3E0] text-gray-800 border-[#FAF3E0] shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-[#F5E6C9] border-gray-200'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {categories.find((c) => c.id === selectedCategory).fields.courseName}
                        </label>
                        <input
                            type="text"
                            value={formData.courseName}
                            onChange={(e) =>
                                setFormData({ ...formData, courseName: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                            placeholder="e.g. Basic Italian Cooking"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {categories.find((c) => c.id === selectedCategory).fields.title}
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                            placeholder="e.g. Homemade Pasta"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {categories.find((c) => c.id === selectedCategory).fields.details}
                        </label>
                        <textarea
                            value={formData.details}
                            onChange={(e) =>
                                setFormData({ ...formData, details: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none min-h-[120px]"
                            placeholder="Share your experience, tips, or favorite moment..."
                        />
                    </div>

                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 shadow-lg transition"
                        >
                            Post Progress
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all scale-100 animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="mx-auto mb-4 text-5xl">🗑️</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Progress Entry</h3>
                            <p className="text-gray-600">
                                Are you sure you want to delete this learning progress? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex space-x-4 justify-center mt-8">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 py-2.5 bg-white text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200 border border-gray-300 font-medium min-w-[120px]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2.5 bg-[#FAF3E0] text-gray-800 rounded-full hover:bg-[#F5E6C9] transition-colors duration-200 font-medium min-w-[120px] shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Popup */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all scale-100 animate-fade-in">
                        <div className="text-center mb-4">
                            <div className="mx-auto mb-4 text-5xl">✅</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
                            <p className="text-gray-600 bg-green-50 p-4 rounded-xl border border-green-100">
                                Your learning progress has been successfully posted.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressForm;
