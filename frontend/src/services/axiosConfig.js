import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,  // Enable credentials for CORS
    timeout: 30000,  // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
    }
});

// Add request interceptor for logging and token handling
instance.interceptors.request.use(
    config => {
        // Get the JWT token if it exists
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Special handling for file uploads
        if (config.url === '/api/upload' || config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            config.timeout = 300000; // 5 minutes for uploads
        }
        
        return config;
    },
    error => {
        console.error('Request setup error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling with retries
instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // Don't retry if we already hit max retries or if it's not a timeout/network error
        if (originalRequest._retryCount >= 3 || 
            (error.response && ![408, 429, 500, 502, 503, 504].includes(error.response.status))) {
            if (error.response) {
                console.error('Server Error:', error.response.status, error.response.data);
                error.message = error.response.data?.message || 'An error occurred while processing your request';
            }
            return Promise.reject(error);
        }

        // Handle network errors and timeouts with retry
        if (!error.response || [408, 429, 500, 502, 503, 504].includes(error.response?.status)) {
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            
            // Calculate delay with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 10000);
            
            try {
                await new Promise(resolve => setTimeout(resolve, delay));
                console.log(`Retrying request (attempt ${originalRequest._retryCount})...`);
                return instance(originalRequest);
            } catch (retryError) {
                console.error('Retry failed:', retryError);
                error.message = 'Request failed. Please try again later.';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
