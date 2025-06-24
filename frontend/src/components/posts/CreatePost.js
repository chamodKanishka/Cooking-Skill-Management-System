import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');  const [files, setFiles] = useState([]);
  const [mediaType, setMediaType] = useState('photo');
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description) {
      alert('Please fill in all required fields');
      return;
    }

    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    const formData = new FormData();
    let hasValidFiles = false;
    let totalSize = 0;
    
    for (const file of files) {
      if (file && file.size > 0) {
        totalSize += file.size;
        if (totalSize > 30 * 1024 * 1024) { // 30MB total limit
          alert('Total file size exceeds 30MB limit');
          return;
        }
        formData.append('files', file, file.name);
        hasValidFiles = true;
      }
    }

    if (!hasValidFiles) {
      alert('Please select valid files');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate user is logged in first
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not logged in');
      }
      const user = JSON.parse(userData);

      // Handle file upload with retries
      const maxRetries = 3;
      let attempt = 0;
      let uploadResponse = null;
      
      while (attempt < maxRetries) {
        try {
          uploadResponse = await api.post('/api/upload', formData, {
            onUploadProgress: (progressEvent) => {
              if (!progressEvent.total) return; // Skip if total is not available
              // Calculate progress as a whole number between 0 and 100
              const calculatedProgress = (progressEvent.loaded / progressEvent.total) * 100;
              // Use parseInt to avoid floating point issues
              const progress = parseInt(calculatedProgress);
              // Only update if the progress has changed
              if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                setUploadProgress(progress);
              }
            }
          });
          break; // Success, exit the loop
        } catch (uploadError) {
          attempt++;
          if (attempt === maxRetries) {
            throw new Error(`File upload failed after ${maxRetries} attempts: ${uploadError.message}`);
          }
          setUploadProgress(0); // Reset progress for retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Wait before retry
        }
      }

      if (!uploadResponse?.data || !Array.isArray(uploadResponse.data) || uploadResponse.data.length === 0) {
        throw new Error('File upload failed - no URLs returned');
      }

      // Create the post
      const post = {
        userId: user.id,
        title,
        description,
        mediaUrls: uploadResponse.data,
        mediaType
      };

      const postResponse = await api.post('/api/posts', post);
      
      if (!postResponse?.data) {
        throw new Error('Post creation failed - no response data');
      }

      // Reset form on success
      setTitle('');
      setDescription('');
      setFiles([]);
      setPreviews([]);
      alert('Post created successfully!');
    } catch (err) {
      alert(`Error: ${err.message || 'Something went wrong'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e, index) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Reset any previous upload state
    setIsUploading(false);
    setUploadProgress(0);

    // Validate file type
    if (mediaType === 'photo' && !selected.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (mediaType === 'video' && !selected.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selected.size > maxSize) {
      alert('File is too large. Maximum size is 10MB');
      return;
    }

    const newFiles = [...files];
    newFiles[index] = selected;
    setFiles(newFiles.filter(Boolean));
      // Create preview
    const newPreviews = [...previews];
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]); // Clean up old preview
    }
    newPreviews[index] = URL.createObjectURL(selected);
    setPreviews(newPreviews.filter(Boolean));
  };

  const addMoreImages = () => {
    if (files.length < 3) {
      setFiles([...files, null]);
    }
  };

  const removeImage = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
    
    // Clean up preview URL
    const updatedPreviews = [...previews];
    URL.revokeObjectURL(updatedPreviews[index]); // Clean up old preview
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <div className="min-h-[50vh] bg-gray-100 flex justify-center px-4 py-2">
      <div className="bg-white shadow-sm rounded-lg w-full max-w-xl p-3 space-y-3">
        <h2 className="text-base font-bold text-gray-800 text-center">🍳 What's Cooking?</h2>

        <div className="space-y-1.5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of your recipe..."
            className="w-full text-sm font-medium border-none outline-none bg-transparent px-2 py-1 placeholder-gray-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your dish or share a story..."
            rows={2}
            className="w-full text-sm border-none outline-none resize-none bg-transparent px-2 py-1 placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMediaType('photo')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-full text-xs font-medium transition ${
              mediaType === 'photo'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            📷 Photos
          </button>
          <button
            onClick={() => {
              setMediaType('video');
              setFiles([]);
            }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-full text-xs font-medium transition ${
              mediaType === 'video'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            🎥 Video
          </button>
        </div>

        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Media Upload</label>

          {mediaType === 'photo' ? (            <div className="space-y-1.5">
              {files.map((file, index) => (
                <div key={`file-upload-${index}`} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, index)}
                      accept="image/*,.heic,.heif"
                      className="flex-1 bg-white p-1 border border-gray-300 rounded text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                  {previews[index] && (
                    <div className="mt-1">
                      <img
                        src={previews[index]}
                        alt={`Preview ${index + 1}`}
                        className="h-16 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
              {files.length < 3 && (
                <button
                  type="button"
                  onClick={addMoreImages}
                  className="flex items-center text-xs text-orange-500 hover:underline"
                >
                  ➕ Add another image
                </button>
              )}
            </div>
          ) : (
            <input
              type="file"
              onChange={(e) => handleFileChange(e, 0)}
              accept="video/*"
              className="w-full bg-white p-1 border border-gray-300 rounded text-sm"
              required
            />
          )}
        </div>        <div className="space-y-2">
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div 
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-center text-gray-500">Uploading... {uploadProgress}%</p>
            </div>
          )}
          <button
            onClick={handleSubmit}
            className="w-full py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition disabled:opacity-50"
            disabled={mediaType === 'photo' && files.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Share Cooking Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
