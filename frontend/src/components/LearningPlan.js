import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FaBowlFood, FaLightbulb, FaCarrot, FaPenToSquare, FaTrashCan
} from 'react-icons/fa6';
import { PiBooksThin } from 'react-icons/pi';

const LearningPlan = () => {
    const [learningPlan, setLearningPlan] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editForm, setEditForm] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [viewingPlan, setViewingPlan] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);

    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        withCredentials: false,
        timeout: 10000
    };

    useEffect(() => {
        fetchPlan();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPlan = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('http://localhost:8080/api/plan', axiosConfig);

            if (response.data) {
                const validatedData = (response.data || []).map(item => ({
                    ...item,
                    id: item.id || item._id,
                    courseName: (item.courseName && item.courseName !== 'N/A' && item.courseName !== 'Untitled Course') ? item.courseName : '',
                    title: item.title || '',
                    details: item.details || '',
                    dateCreated: item.dateCreated || new Date().toISOString(),
                    lastModified: item.lastModified || new Date().toISOString(),
                    templateType: item.templateType || 'recipe',
                }));
                setLearningPlan(validatedData);
            } else {
                throw new Error('No data received from server');
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Failed to load plan data');
            setLearningPlan([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan({
            ...plan,
            ingredients: plan.details.split('\n')[0] || '',
            steps: plan.details.split('\n')[1] || '',
        });
        setEditingId(plan.id);
    };

    const handleEditModalUpdate = async () => {
        try {
            const updatedPlan = {
                ...editingPlan,
                courseName: editingPlan.courseName.trim(),
                title: editingPlan.title.trim(),
                details: `${editingPlan.ingredients?.trim() || ''}\n${editingPlan.steps?.trim() || ''}`,
            };
            await axios.put(`http://localhost:8080/api/plan/${editingId}`, updatedPlan, axiosConfig);
            setEditingId(null);
            setEditingPlan(null);
            fetchPlan();
        } catch (error) {
            setError('Failed to update plan');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await axios.delete(`http://localhost:8080/api/plan/${id}`, axiosConfig);
                setLearningPlan(learningPlan.filter(item => item.id !== id));
            } catch (error) {
                setError('Failed to delete plan');
            }
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
        <div className="max-w-7xl mx-auto p-8 min-h-[80vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 hover:text-gray-900 transition-colors duration-200 cursor-pointer">
                My Learnings
            </h2>
            {/* View Plan Modal */}
            {viewingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <button
                            className="sticky top-3 right-3 float-right text-gray-400 hover:text-orange-500 text-2xl font-bold z-10 bg-white"
                            onClick={() => setViewingPlan(null)}
                        >
                            &times;
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-orange-700">{viewingPlan.title}</h3>
                        {viewingPlan.courseName && (
                            <div className="mb-2 text-xs text-orange-700 font-semibold">Course: {viewingPlan.courseName}</div>
                        )}
                        <div className="mb-4">
                            <span className="block text-gray-800 font-semibold mb-1">Description:</span>
                            <div className="block text-gray-700 whitespace-pre-line bg-orange-50 rounded-lg p-3 text-base font-normal">
                                {viewingPlan.description || ''}
                            </div>
                        </div>
                        <div className="mb-4">
                            <span className="block text-gray-800 font-semibold mb-1">Ingredients:</span>
                            <div className="block text-gray-700 whitespace-pre-line bg-orange-50 rounded-lg p-3 text-base font-normal">
                                {viewingPlan.details ? viewingPlan.details : ''}
                            </div>
                        </div>
                        {viewingPlan.timeline && viewingPlan.timeline.length > 0 && (
                            <div className="mb-2">
                                <span className="block text-gray-800 font-semibold">Timeline:</span>
                                <ul className="list-disc list-inside ml-4">
                                    {viewingPlan.timeline.map((step, idx) => (
                                        <li key={idx} className="mb-1">
                                            <span className="text-gray-700">{step.step}</span>
                                            {step.duration && (
                                                <span className="ml-2 text-xs text-gray-500">({step.duration})</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Edit Plan Modal */}
            {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            className="sticky top-3 right-3 float-right text-gray-400 hover:text-orange-500 text-2xl font-bold z-10 bg-white"
                            onClick={() => { setEditingPlan(null); setEditingId(null); }}
                        >
                            &times;
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-orange-700">Edit Plan</h3>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditModalUpdate(); }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                <input
                                    type="text"
                                    value={editingPlan.courseName}
                                    onChange={e => setEditingPlan({ ...editingPlan, courseName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                                    placeholder="Course Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editingPlan.title}
                                    onChange={e => setEditingPlan({ ...editingPlan, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                                    placeholder="Title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editingPlan.ingredients}
                                    onChange={e => setEditingPlan({ ...editingPlan, ingredients: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none min-h-[60px]"
                                    placeholder="Description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                                <textarea
                                    value={editingPlan.steps}
                                    onChange={e => setEditingPlan({ ...editingPlan, steps: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none min-h-[60px]"
                                    placeholder="Ingredients"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 shadow-md transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setEditingPlan(null); setEditingId(null); }}
                                    className="px-4 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
            {loading ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {learningPlan.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="bg-orange-50 p-4 border-b border-orange-100 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-full border shadow-sm">
                                        {getTemplateIcon(plan.templateType)}
                                    </div>
                                    <div className="flex-1">
                                        {plan.courseName && (
                                            <div className="inline-block px-3 py-1 text-xs text-green-700 bg-green-100 rounded-full text-base">
                                                {plan.courseName}
                                            </div>
                                        )}
                                        <h3 className="text-lg font-bold text-gray-800">{plan.title}</h3>
                                    </div>
                                </div>
                            </div>

                            {editingId === plan.id ? (
                                <div className="p-6 bg-orange-50 rounded-b-2xl shadow-inner">
                                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditModalUpdate(); }}>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                            <input
                                                type="text"
                                                value={editForm.courseName}
                                                onChange={e => setEditForm({ ...editForm, courseName: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                                                placeholder="Course Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none"
                                                placeholder="Title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                                            <textarea
                                                value={editForm.details}
                                                onChange={e => setEditForm({ ...editForm, details: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none min-h-[100px]"
                                                placeholder="Additional Details"
                                                rows="3"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 shadow-md transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="px-4 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-6 space-y-4 text-sm text-gray-700 rounded-b-2xl">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="capitalize">{plan.templateType}</span>
                                        <span>{formatDate(plan.dateCreated)}</span>
                                    </div>

                                    {plan.courseName && (
                                        <div className="text-sm text-orange-600 font-semibold">Course: {plan.courseName}</div>
                                    )}

                                    <div>
                                        <div className="font-semibold text-gray-800">Title:</div>
                                        <div className="text-gray-900 text-base">{plan.title}</div>
                                    </div>

                                    <div>
                                        <div className="font-semibold text-gray-800">Description:</div>
                                        <div className="text-gray-700 whitespace-pre-line">{plan.description || plan.details.split('\n')[0]}</div>
                                    </div>

                                    <div>
                                        <div className="font-semibold text-gray-800">Ingredients:</div>
                                        <div className="text-gray-700 whitespace-pre-line">{plan.ingredients || plan.details.split('\n').slice(1).join('\n')}</div>
                                    </div>

                                    {plan.timeline && plan.timeline.length > 0 && (
                                        <div>
                                            <div className="font-semibold text-gray-800">Timeline:</div>
                                            <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                                                {plan.timeline.map((step, idx) => (
                                                    <li key={idx}>
                                                        {step.step}
                                                        {step.duration && (
                                                            <span className="ml-2 text-xs text-gray-500">({step.duration})</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => setViewingPlan(plan)}
                                            className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                                            title="View"
                                        >
                                            <span className="sr-only">View</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(plan)}
                                            className="flex items-center justify-center w-8 h-8 bg-[#FAF3E0] text-gray-800 rounded-full hover:bg-[#F5E6C9] transition-colors"
                                            title="Edit"
                                        >
                                            <FaPenToSquare className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <FaTrashCan className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LearningPlan;
