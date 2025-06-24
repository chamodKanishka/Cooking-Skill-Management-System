import React, { useState, useEffect } from 'react';
import {
    FaBowlFood, FaLightbulb, FaCarrot, FaPenToSquare, FaTrashCan
} from 'react-icons/fa6';
import { PiBooksThin } from 'react-icons/pi';
import api from '../services/axiosConfig';

const ProgressList = ({ progress }) => {
    const [progressList, setProgressList] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editForm, setEditForm] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUserId(user.id);
        }
    }, []);

    useEffect(() => {
        if (progress) {
            const validatedData = (progress || []).map(item => ({
                ...item,
                id: item.id || item._id,
                courseName: item.courseName || 'Untitled Course',
                title: item.title || 'No Title',
                details: item.details || '',
                dateCreated: item.dateCreated || new Date().toISOString(),
                lastModified: item.lastModified || new Date().toISOString(),
                templateType: item.templateType || 'recipe',
            }));
            setProgressList(validatedData);
            setLoading(false);
        } else {
            fetchProgress();
        }
    }, [progress]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            setError('');
            const userData = localStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;
            const endpoint = user ? `/api/progress/user/${user.id}` : '/api/progress';
            const response = await api.get(endpoint);

            if (response.data) {
                const validatedData = (response.data || []).map(item => ({
                    ...item,
                    id: item.id || item._id,
                    courseName: item.courseName || 'Untitled Course',
                    title: item.title || 'No Title',
                    details: item.details || '',
                    dateCreated: item.dateCreated || new Date().toISOString(),
                    lastModified: item.lastModified || new Date().toISOString(),
                    templateType: item.templateType || 'recipe',
                }));
                setProgressList(validatedData);
            } else {
                throw new Error('No data received from server');
            }} catch (error) {
            const errorMessage = typeof error.response?.data === 'object' 
                ? error.response?.data?.message 
                : typeof error.response?.data === 'string' 
                    ? error.response?.data 
                    : error.message || 'Failed to load progress data';
            setError(errorMessage);
            setProgressList([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check if user has permission
    const hasPermission = (progressUserId) => {
        return currentUserId && progressUserId === currentUserId;
    };

    const showError = (message) => {
        setError(message);
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            setError('');
        }, 3000);
    };

    // Modified handleEdit function with auto-dismissing error
    const handleEdit = (progress) => {
        if (!hasPermission(progress.userId)) {
            showError('You can only edit your own progress entries');
            return;
        }
        setEditingId(progress.id);
        setEditForm({
            ...progress,
            courseName: progress.courseName || '',
            title: progress.title || '',
            details: progress.details || '',
            templateType: progress.templateType,
        });
    };

    const handleUpdate = async () => {
        try {
            const updatedProgress = {
                ...editForm,
                courseName: editForm.courseName.trim(),
                title: editForm.title.trim(),
                details: editForm.details.trim(),
            };
            await api.put(`/api/progress/${editingId}`, updatedProgress);
            setEditingId(null);
            fetchProgress();        } catch (error) {
            const errorMessage = typeof error.response?.data === 'object' 
                ? error.response?.data?.message 
                : typeof error.response?.data === 'string' 
                    ? error.response?.data 
                    : 'Failed to update progress';
            setError(errorMessage);
        }
    };

    // Modified handleDelete function with auto-dismissing error
    const handleDelete = (id, userId) => {
        if (!hasPermission(userId)) {
            showError('You can only delete your own progress entries');
            return;
        }
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/progress/${itemToDelete}`);
            setProgressList(progressList.filter(item => item.id !== itemToDelete));
            setShowDeleteModal(false);
            setItemToDelete(null);        } catch (error) {
            const errorMessage = typeof error.response?.data === 'object' 
                ? error.response?.data?.message 
                : typeof error.response?.data === 'string' 
                    ? error.response?.data 
                    : 'Failed to delete progress';
            setError(errorMessage);
        }
    };

    const getTemplateIcon = (type) => {
        switch (type) {
            case 'recipe':
                return <FaBowlFood className="text-orange-500 w-6 h-6" />;
            case 'technique':
                return <FaLightbulb className="text-orange-500 w-6 h-6" />;
            case 'ingredient':
                return <FaCarrot className="text-orange-500 w-6 h-6" />;
            default:
                return <PiBooksThin className="text-orange-500 w-6 h-6" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Colombo',
            }).format(date);
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 hover:text-gray-900 transition-colors duration-200 cursor-pointer">
                My Learnings
            </h2>
            {error && (
                <div className="fixed top-4 right-4 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg animate-fade-in">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                        <button 
                            onClick={() => setError('')} 
                            className="ml-3 text-red-500 hover:text-red-700"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            {loading ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                    {progressList.map((progress) => (
                        <div key={progress.id} className={`group bg-white rounded-2xl shadow-md border ${editingId === progress.id ? 'border-orange-200 ring-2 ring-orange-100' : 'border-orange-100 hover:shadow-xl transition-all duration-300 hover:border-orange-200'}`}>
                            {!hasPermission(progress.userId) && (
                                <div className="absolute top-2 right-2">
                                    <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Read Only
                                    </div>
                                </div>
                            )}
                            <div className="bg-gradient-to-r from-orange-50 to-white p-6 border-b border-orange-100 rounded-t-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl border border-orange-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                                        {getTemplateIcon(progress.templateType)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="inline-block px-4 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 rounded-full border border-orange-200 shadow-sm">
                                                {progress.courseName}
                                            </div>
                                            {hasPermission(progress.userId) && (
                                                <div className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full border border-green-200">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Owner
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors duration-300">{progress.title}</h3>
                                    </div>
                                    {!editingId && hasPermission(progress.userId) && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => handleEdit(progress)}
                                                className="p-2 hover:bg-orange-50 rounded-full transition-colors"
                                                title="Edit Entry"
                                            >
                                                <FaPenToSquare className="w-4 h-4 text-orange-500" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {editingId === progress.id ? (
                                <div className="p-6 bg-orange-50/30">
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Course Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.courseName}
                                                onChange={(e) => setEditForm({ ...editForm, courseName: e.target.value })}
                                                className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border-2 border-orange-100 focus:border-orange-300 focus:ring-2 focus:ring-orange-200 transition-all duration-200 shadow-sm"
                                                placeholder="Enter course name..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border-2 border-orange-100 focus:border-orange-300 focus:ring-2 focus:ring-orange-200 transition-all duration-200 shadow-sm"
                                                placeholder="Enter learning title..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Learning Reflections
                                            </label>
                                            <textarea
                                                value={editForm.details}
                                                onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                                                className="w-full px-4 py-3 text-sm bg-white rounded-xl border-2 border-orange-100 focus:border-orange-300 focus:ring-2 focus:ring-orange-200 transition-all duration-200 min-h-[120px] resize-none shadow-sm"
                                                placeholder="Share your learning experience, insights, and key takeaways..."
                                                rows="4"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-orange-100">
                                        <button 
                                            onClick={() => setEditingId(null)} 
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Cancel Edit
                                        </button>
                                        <button 
                                            onClick={handleUpdate} 
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5">
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4 mt-6">
                                        <span className="bg-gradient-to-r from-orange-50 to-white px-4 py-1.5 rounded-full capitalize text-orange-600 font-medium border border-orange-100 shadow-sm flex items-center gap-2">
                                            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                            {progress.templateType}
                                        </span>
                                        <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full text-gray-600 border border-gray-100">
                                            <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            {formatDate(progress.dateCreated)}
                                        </span>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                                        {progress.details ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <h4 className="font-medium text-gray-800">Learning Reflections</h4>
                                                </div>
                                                <div className="bg-white/50 rounded-lg p-4 border border-gray-50">
                                                    <div className="grid grid-cols-12 gap-6">
                                                        {/* Left Column - Labels */}
                                                        <div className="col-span-3 space-y-4 text-right border-r border-gray-100 pr-6">
                                                            <div className="text-sm font-medium text-gray-500">Step</div>
                                                            <div className="text-sm font-medium text-gray-500">Duration</div>
                                                            <div className="text-sm font-medium text-gray-500">Status</div>
                                                            <div className="text-sm font-medium text-gray-500">Notes</div>
                                                        </div>
                                                        
                                                        {/* Right Column - Content */}
                                                        <div className="col-span-9 space-y-4">
                                                            <div className="text-sm text-gray-800 font-medium">
                                                                Prepare dashi stock and pickled vegetables
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span className="text-sm text-gray-600">12 hours (overnight preparation)</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex items-center gap-1.5">
                                                                    <span className="relative flex h-3 w-3">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                                                    </span>
                                                                    <span className="text-sm font-medium text-orange-600">In Progress</span>
                                                                </span>
                                                            </div>
                                                            <div className="relative pl-4 border-l-2 border-orange-100 ml-0">
                                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                                    Requires soaking or marinating overnight for optimal flavor development.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 bg-white/50 rounded-lg border border-dashed border-gray-200">
                                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-400 text-sm text-center">
                                                    No learning reflections recorded yet
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6 px-6 py-4 border-t border-gray-100">
                                        {hasPermission(progress.userId) && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(progress)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FAF3E0] text-gray-800 rounded-full hover:bg-[#F5E6C9] transition-all duration-300 group-hover:shadow-md"
                                                    title="Edit Entry"
                                                >
                                                    <FaPenToSquare className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(progress.id, progress.userId)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 group-hover:shadow-md"
                                                    title="Delete Entry"
                                                >
                                                    <FaTrashCan className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Delete</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gradient-to-br from-orange-50/95 to-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all scale-100 animate-fade-in border border-orange-100">
                        <div className="text-center mb-6">
                            <div className="mx-auto mb-4 w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                                <span className="text-4xl">🗑️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Learning Entry</h3>
                            <p className="text-gray-600 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                Are you sure you want to delete this learning progress? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex space-x-4 justify-center mt-8">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setItemToDelete(null);
                                }}
                                className="px-6 py-2.5 bg-white text-gray-700 rounded-full hover:bg-orange-50 transition-all duration-200 border border-orange-200 font-medium min-w-[120px] shadow-sm hover:shadow-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-200 font-medium min-w-[120px] shadow-md hover:shadow-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressList;
