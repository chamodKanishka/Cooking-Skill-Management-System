import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostList from './components/posts/PostList';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import CreatePost from './components/posts/CreatePost';
import { UsersProvider } from './contexts/UsersContext';
import './App.css';
import SocialInteractionBar from './components/common/SocialInteractionBar.js';
import NotificationBar from './components/common/NotificationBar.js';
import NotificationList from './components/common/NotificationList.js';
import FollowButton from './components/common/FollowButton.js';
import LearningPlanForm from './components/common/LearningPlanForm.js';
import LearningPlan from './components/LearningPlan.js';
import ViewLearningPlan from './components/common/ViewLearningPlan.js';
import ProgressForm from './components/ProgressForm.js';
import ProgressList from './components/ProgressList.js';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <GoogleOAuthProvider clientId="351068781419-3pu3srbviiea5oasgf35akgj8nfc8nid.apps.googleusercontent.com">
      <UsersProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<PostList />} />
                <Route path="search" element={<div>Search Page</div>} />
                <Route path="explore" element={<Explore />} />
                <Route path="messages" element={<div>Messages Page</div>} />
                <Route path="notifications" element={<NotificationList />} />
                <Route path="profile" element={<Profile />} />
                <Route path="user/:userId" element={<UserProfile />} />
                <Route path="create" element={<CreatePost />} />
                <Route path="learning-plan-create" element={<LearningPlanForm />} />
                <Route path="learning-plans" element={<ViewLearningPlan />} />
                <Route path="plan" element={<LearningPlan />} />
                <Route path="progress" element={<ProgressForm />} />
                <Route path="progress-list" element={<ProgressList />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </UsersProvider>
    </GoogleOAuthProvider>
  );
}

export default App;