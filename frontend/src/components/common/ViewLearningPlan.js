import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    FaBowlFood, FaLightbulb, FaCarrot
} from 'react-icons/fa6';
import { PiBooksThin } from 'react-icons/pi';

const ViewLearningPlan = () => {
    const navigate = useNavigate();
    const [learningPlan, setLearningPlan] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [checkedSteps, setCheckedSteps] = useState({});
    const [stepsPopupPlan, setStepsPopupPlan] = useState(null);

    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        withCredentials: false,
        timeout: 10000
    };    useEffect(() => {
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
                    courseName: item.courseName || 'Untitled Course',
                    title: item.title || 'No Title',
                    details: item.details || '',
                    steps: item.steps || [],
                    timeline: item.timeline || [],
                    dateCreated: item.dateCreated || new Date().toISOString(),
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

    const handleCheckboxChange = (planId, stepIndex) => {
        setCheckedSteps(prev => {
            const current = prev[planId] || [];
            const updated = current.includes(stepIndex)
                ? current.filter(i => i !== stepIndex)
                : [...current, stepIndex];
            return { ...prev, [planId]: updated };
        });
    };    const handleShareProgress = (plan) => {
        const completedSteps = checkedSteps[plan.id] || [];
        if (completedSteps.length === 0) {
            alert('Please select at least one completed step to share your progress');
            return;
        }

        // Navigate to progress form with pre-populated data
        navigate('/dashboard/progress', { 
            state: {
                courseName: plan.courseName,
                title: `Progress on "${plan.title}"`,
                templateType: plan.templateType,
                userId: plan.userId,
                details: `Completed ${completedSteps.length} step(s) out of ${plan.timeline?.length || 0} total steps\n\nCompleted steps:\n${
                    completedSteps.map(index => `✓ ${plan.timeline[index].step}`).join('\n')
                }`
            }
        });
    };    const handleShareStep = (plan, stepIndex) => {
        const stepsArr = plan.timeline || [];
        const step = stepsArr[stepIndex];
        const isChecked = checkedSteps[plan.id]?.includes(stepIndex) || false;

        // Navigate to progress form with pre-populated data
        navigate('/dashboard/progress', { 
            state: {
                courseName: plan.courseName,
                title: `Progress on step in "${plan.title}"`,
                templateType: plan.templateType,
                userId: plan.userId,
                details: `Progress update for step: ${step.step}\nDuration: ${step.duration}\nStatus: ${isChecked ? '✓ Completed' : '⏳ In Progress'}`
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 hover:text-gray-900 transition-colors duration-200 cursor-pointer">
                My Learnings
            </h2>
            {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
            {loading ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {learningPlan.map((plan) => {
                        // Extract description and ingredients if details contains two lines
                        const detailsLines = plan.details.split('\n');
                        const description = detailsLines[0] || 'No description available.';
                        const ingredients = detailsLines[1] || 'No ingredients listed.';

                        console.log('DEBUG: plan.timeline', plan.timeline);

                        return (
                            <div key={plan.id} className="bg-white rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-all">
                                <div className="bg-orange-50 p-4 border-b border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-full border shadow-sm">
                                            {getTemplateIcon(plan.templateType)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="inline-block px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
                                                {plan.courseName}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800">{plan.title}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <span className="capitalize">{plan.templateType}</span>
                                        <span className="ml-2 text-xs">{formatDate(plan.dateCreated)}</span>
                                    </div>

                                    {/* Description & Ingredients side by side */}
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h4 className="font-semibold text-lg mb-1 text-orange-700 flex items-center gap-2">
                                                <PiBooksThin /> Description
                                            </h4>
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap min-h-[80px]">
                                                {description}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-lg mb-1 text-orange-700 flex items-center gap-2">
                                                <FaCarrot /> Ingredients
                                            </h4>
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap min-h-[80px]">
                                                {ingredients}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Steps list with checkbox and share button for each step */}
                                    {(plan.timeline && plan.timeline.length > 0) ? (
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-lg mb-2 text-orange-700 flex items-center gap-2">
                                                Steps
                                            </h4>
                                            <ul className="space-y-4">
                                                {plan.timeline.map((step, index) => (
                                                    <li key={index} className="flex items-center justify-between gap-3 p-3 border rounded-lg shadow-sm bg-orange-50 hover:bg-orange-100 transition-colors">
                                                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                            <input
                                                                type="checkbox"
                                                                className="accent-orange-500"
                                                                checked={checkedSteps[plan.id]?.includes(index) || false}
                                                                onChange={() => handleCheckboxChange(plan.id, index)}
                                                                aria-label={`Mark step ${index + 1} as completed`}
                                                            />
                                                            <span className="text-sm text-gray-700">
                                                                {step.step}
                                                                {step.duration && (
                                                                    <span className="ml-2 text-xs text-gray-500">({step.duration})</span>
                                                                )}
                                                            </span>
                                                        </label>
                                                        <button
                                                            onClick={() => handleShareStep(plan, index)}
                                                            className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 shadow-sm transition-colors"
                                                        >
                                                            Share 
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="mb-6 text-gray-500 italic">No steps available for this plan.</div>
                                    )}

                                    {/* Share progress */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleShareProgress(plan)}
                                            className="px-5 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm shadow-md transition-colors"
                                        >
                                            Share Progress
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ViewLearningPlan;
