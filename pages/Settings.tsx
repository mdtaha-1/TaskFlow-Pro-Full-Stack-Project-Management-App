import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme, useAppData } from '../App';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  Upload,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Star,
  TrendingUp,
  HelpCircle,
  Book,
  MessageSquare,
  CheckCircle,
  ExternalLink,
  Search
} from 'lucide-react';
import { usersAPI } from '../services/api';

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentUser, updateTeamMember } = useAppData();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Profile form state with real user data
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '+1 (555) 123-4567', // This would come from user data in a real app
    location: 'San Francisco, CA', // This would come from user data in a real app
    bio: 'Passionate about creating amazing user experiences and building great products.',
    company: 'Tech Innovations Inc.',
    position: currentUser?.role || ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskUpdates: true,
    projectUpdates: true,
    teamInvites: true,
    weeklyDigest: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'team',
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Convert file to base64 for demo purposes
      // In a real app, you'd upload to a cloud storage service
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        
        try {
          // Update profile with new avatar
          const response = await usersAPI.updateProfile({
            name: profileForm.name,
            email: profileForm.email,
            avatar: base64String // In production, this would be a URL from cloud storage
          });

          if (response.data) {
            // Update the user data in the app context
            const updatedUser = {
              ...currentUser!,
              avatar: base64String,
            };

            // Update in localStorage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Update in team members list if the function exists
            if (updateTeamMember && currentUser?.id) {
              updateTeamMember(currentUser.id, {
                avatar: base64String,
              });
            }

            // Show success message
            alert('Profile picture updated successfully!');
            
            // Force a page reload to ensure all components reflect the changes
            window.location.reload();
          }
        } catch (error: any) {
          console.error('Avatar update error:', error);
          alert('Failed to update profile picture. Please try again.');
        } finally {
          setIsUploadingAvatar(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading error:', error);
      alert('Failed to read file. Please try again.');
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update profile via API
      const response = await usersAPI.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        avatar: currentUser?.avatar // Keep existing avatar
      });

      if (response.data) {
        // Update the user data in the app context
        const updatedUser = {
          ...currentUser!,
          name: response.data.name,
          email: response.data.email,
        };

        // Update in localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update in team members list if the function exists
        if (updateTeamMember && currentUser?.id) {
          updateTeamMember(currentUser.id, {
            name: response.data.name,
            email: response.data.email,
          });
        }

        // Show success message
        alert('Profile updated successfully!');
        
        // Force a page reload to ensure all components reflect the changes
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // Here you would typically save to backend
    console.log('Notification settings updated:', { [key]: value });
  };

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    // Here you would typically save to backend
    console.log('Privacy settings updated:', { [key]: value });
  };

  const renderProfileSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Profile Settings
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your personal information and preferences
        </p>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={currentUser?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </label>
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Profile Picture
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload a new profile picture. JPG, PNG or GIF (max 5MB)
            </p>
            {isUploadingAvatar && (
              <p className="text-sm text-blue-600 mt-1">Uploading...</p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Name *
            </label>
            <div className="relative">
              <User className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-white' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email Address *
            </label>
            <div className="relative">
              <Mail className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                required
                className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-white' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone Number
            </label>
            <div className="relative">
              <Phone className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-white' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Location
            </label>
            <div className="relative">
              <MapPin className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={profileForm.location}
                onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-white' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Company
            </label>
            <div className="relative">
              <Briefcase className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={profileForm.company}
                onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-white' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Position/Role
            </label>
            <input
              type="text"
              value={profileForm.position}
              onChange={(e) => setProfileForm(prev => ({ ...prev, position: e.target.value }))}
              className={`w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700 text-white' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Bio
          </label>
          <textarea
            value={profileForm.bio}
            onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700 text-white' 
                : 'bg-gray-50 border border-gray-200 text-gray-900'
            }`}
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || isUploadingAvatar}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );

  const renderNotificationSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Notification Settings
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Choose how you want to be notified about updates
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Get notified about {key.toLowerCase().replace(/([A-Z])/g, ' $1')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleNotificationChange(key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('Notification settings saved!')}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Save className="w-5 h-5" />
          <span>Save Preferences</span>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderPrivacySettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Privacy Settings
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Control your privacy and data sharing preferences
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Profile Visibility
          </label>
          <select
            value={privacy.profileVisibility}
            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700 text-white' 
                : 'bg-gray-50 border border-gray-200 text-gray-900'
            }`}
          >
            <option value="public">Public</option>
            <option value="team">Team Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        {['showEmail', 'showPhone', 'allowDirectMessages'].map((key) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {key === 'showEmail' && 'Display your email address on your profile'}
                {key === 'showPhone' && 'Display your phone number on your profile'}
                {key === 'allowDirectMessages' && 'Allow team members to send you direct messages'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy[key as keyof typeof privacy] as boolean}
                onChange={(e) => handlePrivacyChange(key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('Privacy settings saved!')}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderAppearanceSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Appearance Settings
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize the look and feel of your workspace
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Dark Mode
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Switch between light and dark themes
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleDarkMode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('Appearance settings saved!')}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Save className="w-5 h-5" />
          <span>Save Appearance</span>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderAchievementsSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Achievements & Progress
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Track your accomplishments and milestones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievement Cards */}
        <div className={`p-6 rounded-xl border ${
          isDarkMode ? 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-700/50' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-500 rounded-full">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                Task Master
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                Completed 50+ tasks
              </p>
            </div>
          </div>
          <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-200'}`}>
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
            42/50 tasks completed
          </p>
        </div>

        <div className={`p-6 rounded-xl border ${
          isDarkMode ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                Team Player
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                Collaborated on 10+ projects
              </p>
            </div>
          </div>
          <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-200'}`}>
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
            7/10 projects completed
          </p>
        </div>

        <div className={`p-6 rounded-xl border ${
          isDarkMode ? 'bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-700/50' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-500 rounded-full">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                Quality Focused
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                95%+ task completion rate
              </p>
            </div>
          </div>
          <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-200'}`}>
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95%' }}></div>
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Excellent performance!
          </p>
        </div>

        <div className={`p-6 rounded-xl border ${
          isDarkMode ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-500 rounded-full">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                Consistent Contributor
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                30-day activity streak
              </p>
            </div>
          </div>
          <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-200'}`}>
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
            Keep up the great work!
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className={`p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Your Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              42
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tasks Completed
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Projects
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              95%
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Success Rate
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              30
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Day Streak
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderHelpSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Help & Support
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Get help with TaskFlow Pro and find solutions to common issues
        </p>
      </div>

      {/* Quick Help Search */}
      <div className={`p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Quick Help Search
        </h3>
        <div className="relative">
          <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search for help topics..."
            className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className={`p-6 rounded-xl border ${
        isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <Book className="w-6 h-6 text-blue-600" />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            Getting Started Guide
          </h3>
        </div>
        <p className={`mb-4 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
          New to TaskFlow Pro? Learn the basics and get up to speed quickly.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              Creating your first project
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              Adding team members
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              Managing tasks and deadlines
            </span>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Common Issues
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Can't see my projects?
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Make sure you're added as a team member to the project. Contact your project manager if needed.
              </p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Notifications not working?
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Check your notification settings and ensure your browser allows notifications from TaskFlow Pro.
              </p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Forgot your password?
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Use the "Forgot Password" link on the login page to reset your password via email.
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Tips & Tricks
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Keyboard Shortcuts
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Press 'N' to create a new task, 'P' for a new project, and '/' to search.
              </p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Bulk Actions
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Select multiple tasks by holding Ctrl/Cmd and clicking to perform bulk operations.
              </p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Dark Mode
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Toggle dark mode in Appearance settings for better viewing in low-light environments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className={`p-6 rounded-xl border ${
        isDarkMode ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-6 h-6 text-emerald-600" />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
            Still Need Help?
          </h3>
        </div>
        <p className={`mb-4 ${isDarkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>
          Can't find what you're looking for? Our support team is here to help!
        </p>
        <div className="flex flex-wrap gap-4">
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-emerald-800 hover:bg-emerald-700 text-emerald-200' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}>
            <Mail className="w-4 h-4" />
            <span>Email Support</span>
          </button>
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-emerald-800 hover:bg-emerald-700 text-emerald-200' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}>
            <MessageSquare className="w-4 h-4" />
            <span>Live Chat</span>
          </button>
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-emerald-800 hover:bg-emerald-700 text-emerald-200' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}>
            <ExternalLink className="w-4 h-4" />
            <span>Documentation</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className={`p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          System Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>API Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-600 text-sm font-medium">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Database</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-600 text-sm font-medium">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>File Storage</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-600 text-sm font-medium">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'achievements':
        return renderAchievementsSettings();
      case 'help':
        return renderHelpSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className={`rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <div className={`rounded-2xl p-8 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}>
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;