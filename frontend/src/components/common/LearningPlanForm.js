import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LearningPlanForm = ({ onSubmit }) => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        userId: '1',
        templateType: 'recipe',
        title: '',
        description: '',
        difficulty: 'beginner',
        timeline: [{ step: '', duration: '', completed: false }],
        details: {
            ingredients: ''
        },
    });

    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        withCredentials: false
    };

    const handleTimelineChange = (index, field, value) => {
        const updatedTimeline = [...formData.timeline];
        updatedTimeline[index][field] = value;
        setFormData({ ...formData, timeline: updatedTimeline });
    };

    const addTimelineStep = () => {
        setFormData({
            ...formData,
            timeline: [...formData.timeline, { step: '', duration: '', completed: false }]
        });
    };

    const removeTimelineStep = (index) => {
        const updatedTimeline = formData.timeline.filter((_, i) => i !== index);
        setFormData({ ...formData, timeline: updatedTimeline });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        } else if (formData.title.length < 3) {
            errors.title = 'Title must be at least 3 characters';
        }
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            errors.description = 'Description must be at least 10 characters';
        }
        if (!formData.details.ingredients.trim()) {
            errors.ingredients = 'Ingredients are required';
        } else if (formData.details.ingredients.length < 3) {
            errors.ingredients = 'Ingredients must be at least 3 characters';
        }
        if (!formData.difficulty) {
            errors.difficulty = 'Difficulty is required';
        }
        if (!formData.timeline.length) {
            errors.timeline = 'At least one timeline step is required';
        } else {
            formData.timeline.forEach((step, idx) => {
                if (!step.step.trim()) {
                    errors[`timeline_step_${idx}`] = `Step ${idx + 1} description is required`;
                } else if (step.step.length < 3) {
                    errors[`timeline_step_${idx}`] = `Step ${idx + 1} must be at least 3 characters`;
                }
                if (!step.duration.trim()) {
                    errors[`timeline_duration_${idx}`] = `Step ${idx + 1} duration is required`;
                } else if (!/^\d+\s*\w+/.test(step.duration.trim())) {
                    errors[`timeline_duration_${idx}`] = `Step ${idx + 1} duration should be like '15 minutes'`;
                }
            });
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('Please fix the errors in the form.');
            return;
        }

        try {
            const submissionData = {
                ...formData,
                title: formData.title.trim(),
                description: formData.description.trim(),
                timeline: formData.timeline.map(step => ({
                    ...step,
                    step: step.step.trim(),
                    duration: step.duration.trim()
                })),
                details: formData.details.ingredients?.trim() || '',
                dateCreated: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            const response = await axios.post(
                'http://localhost:8080/api/plan',
                submissionData,
                {
                    ...axiosConfig,
                    validateStatus: (status) => status < 500,
                }
            );

            if (response.status === 200 && response.data) {
                onSubmit && onSubmit(response.data);
                clearForm();
                navigate('/dashboard/plan');
            } else {
                setError(response.data || 'Failed to save plan');
            }
        } catch (error) {
            setError(error.response?.data || 'An unexpected error occurred');
        }
    };

    const clearForm = () => {
        setFormData({
            userId: '1',
            templateType: 'recipe',
            title: '',
            description: '',
            difficulty: 'beginner',
            timeline: [{ step: '', duration: '', completed: false }],
            details: {
                ingredients: ''
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl p-8 sm:p-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-800">
                        🍳 Create a Cooking Learning Plan
                    </h2>
                    <button
                        onClick={() => navigate('/dashboard/plan')}
                        className="px-4 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition flex items-center"
                    >
                        <span className="mr-2">👨‍🍳</span> View All Plans
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                        ⚠ {typeof error === 'object' ? JSON.stringify(error) : error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Recipe Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recipe Name
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none bg-orange-50 text-gray-800 text-base font-medium ${fieldErrors.title ? 'border-red-500' : ''}`}
                            placeholder="e.g. Classic Spaghetti Carbonara"
                            required
                        />
                        {fieldErrors.title && <div className="text-red-600 text-xs mt-1">{fieldErrors.title}</div>}
                    </div>

                    {/* Difficulty Level */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Difficulty Level
                            </label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) =>
                                    setFormData({ ...formData, difficulty: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none bg-white"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {/* Recipe Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recipe Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none min-h-[120px] max-h-60 resize-y overflow-auto bg-orange-50 text-gray-800 text-base font-normal whitespace-pre-line ${fieldErrors.description ? 'border-red-500' : ''}`}
                            placeholder="Describe the recipe and its origins..."
                            required
                        />
                        {fieldErrors.description && <div className="text-red-600 text-xs mt-1">{fieldErrors.description}</div>}
                    </div>

                    {/* Ingredients List */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ingredients List
                        </label>
                        <textarea
                            value={formData.details.ingredients}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    details: { ...formData.details, ingredients: e.target.value }
                                })
                            }
                            className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none min-h-[120px] max-h-60 resize-y overflow-auto bg-orange-50 text-gray-800 text-base font-normal whitespace-pre-line ${fieldErrors.ingredients ? 'border-red-500' : ''}`}
                            placeholder="List ingredients with quantities (one per line or comma separated)"
                            required
                        />
                        {fieldErrors.ingredients && <div className="text-red-600 text-xs mt-1">{fieldErrors.ingredients}</div>}
                    </div>

                    {/* Learning Timeline */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">⏱</span> Learning Timeline
                        </h3>

                        {formData.timeline.map((step, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-end">
                                <div className="md:col-span-1">
                                    <span className="text-gray-500 font-medium">Step {index + 1}</span>
                                </div>
                                <div className="md:col-span-7">
                                    <textarea
                                        value={step.step}
                                        onChange={(e) => handleTimelineChange(index, 'step', e.target.value)}
                                        className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none min-h-[80px] ${fieldErrors[`timeline_step_${index}`] ? 'border-red-500' : ''}`}
                                        placeholder="e.g. Prepare the ingredients"
                                        required
                                    />
                                    {fieldErrors[`timeline_step_${index}`] && <div className="text-red-600 text-xs mt-1">{fieldErrors[`timeline_step_${index}`]}</div>}
                                </div>
                                <div className="md:col-span-3">
                                    <input
                                        type="text"
                                        value={step.duration}
                                        onChange={(e) => handleTimelineChange(index, 'duration', e.target.value)}
                                        className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none ${fieldErrors[`timeline_duration_${index}`] ? 'border-red-500' : ''}`}
                                        placeholder="e.g. 15 minutes"
                                        required
                                    />
                                    {fieldErrors[`timeline_duration_${index}`] && <div className="text-red-600 text-xs mt-1">{fieldErrors[`timeline_duration_${index}`]}</div>}
                                </div>
                                <div className="md:col-span-1 flex justify-end">
                                    {formData.timeline.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTimelineStep(index)}
                                            className="p-2 text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addTimelineStep}
                            className="mt-2 px-4 py-2 bg-[#FAF3E0] text-gray-800 rounded-lg hover:bg-[#F5E6C9] transition flex items-center"
                        >
                            <span className="mr-2">+</span> Add Another Step
                        </button>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mt-8">
                        <button
                            type="submit"
                            className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 shadow-lg transition flex items-center"
                        >
                            <span className="mr-2">📝</span> Create Learning Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LearningPlanForm;
