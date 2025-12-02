import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, useAppData } from '../App';
import { Users, Plus, Mail, MessageCircle, MoreHorizontal, X, Send, Edit3, UserMinus, Upload, Save, Clock, RefreshCw, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { teamAPI } from '../services/api';

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  message?: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

const Team: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { teamMembers, tasks, projects } = useAppData();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberToEdit, setMemberToEdit] = useState<any>(null);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'developer',
    message: ''
  });
  
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    avatar: null as File | null
  });

  // Load pending invitations on component mount
  useEffect(() => {
    loadPendingInvitations();
  }, []);

  const loadPendingInvitations = async () => {
    setIsLoadingInvitations(true);
    try {
      // For now, we'll use localStorage to simulate pending invitations
      // In a real app, this would be an API call
      const saved = localStorage.getItem('pendingInvitations');
      if (saved) {
        const invitations = JSON.parse(saved);
        // Filter out expired invitations
        const validInvitations = invitations.filter((inv: PendingInvitation) => 
          new Date(inv.expiresAt) > new Date() && inv.status === 'pending'
        );
        setPendingInvitations(validInvitations);
        // Update localStorage with filtered invitations
        localStorage.setItem('pendingInvitations', JSON.stringify(validInvitations));
      }
    } catch (error) {
      console.error('Error loading pending invitations:', error);
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const savePendingInvitations = (invitations: PendingInvitation[]) => {
    localStorage.setItem('pendingInvitations', JSON.stringify(invitations));
    setPendingInvitations(invitations);
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showInviteModal || showMessageModal || showEditModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showInviteModal, showMessageModal, showEditModal, showDeleteModal]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSendInvite = async () => {
    if (!inviteForm.email.trim()) {
      alert('Please enter an email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteForm.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if user already exists in team
    const existingMember = teamMembers.find(member => 
      member.email.toLowerCase() === inviteForm.email.toLowerCase()
    );
    if (existingMember) {
      alert('This person is already a team member!');
      return;
    }

    // Check if invitation already exists
    const existingInvitation = pendingInvitations.find(inv => 
      inv.email.toLowerCase() === inviteForm.email.toLowerCase() && inv.status === 'pending'
    );
    
    if (existingInvitation) {
      const shouldResend = confirm(
        `An invitation has already been sent to ${inviteForm.email}. Would you like to resend it?`
      );
      if (shouldResend) {
        await handleResendInvitation(existingInvitation.id);
        return;
      } else {
        return;
      }
    }

    setIsInviting(true);
    
    try {
      const response = await teamAPI.sendInvitation(inviteForm);
      
      if (response.data) {
        // Add to pending invitations
        const newInvitation: PendingInvitation = {
          id: Date.now().toString(),
          email: inviteForm.email,
          role: inviteForm.role,
          message: inviteForm.message,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          status: 'pending'
        };
        
        const updatedInvitations = [...pendingInvitations, newInvitation];
        savePendingInvitations(updatedInvitations);
        
        alert(`✅ Invitation sent successfully to ${inviteForm.email}!`);
        
        setInviteForm({
          email: '',
          role: 'developer',
          message: ''
        });
        setShowInviteModal(false);
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      
      if (error.response?.status === 400) {
        alert(`❌ ${error.response.data.message}`);
      } else {
        alert('❌ Failed to send invitation. Please check your email configuration and try again.');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const invitation = pendingInvitations.find(inv => inv.id === invitationId);
      if (!invitation) return;

      // Simulate API call to resend
      await teamAPI.sendInvitation({
        email: invitation.email,
        role: invitation.role,
        message: invitation.message
      });

      // Update the invitation timestamp
      const updatedInvitations = pendingInvitations.map(inv =>
        inv.id === invitationId
          ? { ...inv, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
          : inv
      );
      savePendingInvitations(updatedInvitations);

      alert(`✅ Invitation resent to ${invitation.email}!`);
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('❌ Failed to resend invitation. Please try again.');
    }
  };

  const handleCancelInvitation = (invitationId: string) => {
    const invitation = pendingInvitations.find(inv => inv.id === invitationId);
    if (!invitation) return;

    const shouldCancel = confirm(
      `Are you sure you want to cancel the invitation to ${invitation.email}?`
    );

    if (shouldCancel) {
      const updatedInvitations = pendingInvitations.filter(inv => inv.id !== invitationId);
      savePendingInvitations(updatedInvitations);
      alert(`Invitation to ${invitation.email} has been cancelled.`);
    }
  };

  const handleSendMessage = (member: any) => {
    setSelectedMember(member);
    setMessageForm({
      subject: '',
      message: ''
    });
    setShowMessageModal(true);
    setOpenDropdown(null);
  };

  const handleSubmitMessage = () => {
    if (messageForm.subject.trim() && messageForm.message.trim()) {
      console.log('Sending message to:', selectedMember.name, messageForm);
      // Here you would typically send the message via API
      alert(`Message sent to ${selectedMember.name}!`);
      setMessageForm({
        subject: '',
        message: ''
      });
      setShowMessageModal(false);
      setSelectedMember(null);
    }
  };

  const handleEditProfile = (member: any) => {
    setMemberToEdit(member);
    setEditForm({
      name: member.name,
      email: member.email,
      role: member.role,
      avatar: null
    });
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const handleUpdateProfile = () => {
    if (editForm.name.trim() && editForm.email.trim() && editForm.role.trim()) {
      console.log('Updating profile for:', memberToEdit.name, editForm);
      // Here you would typically update the member via API
      alert(`Profile updated for ${memberToEdit.name}!`);
      setShowEditModal(false);
      setMemberToEdit(null);
      setEditForm({
        name: '',
        email: '',
        role: '',
        avatar: null
      });
    }
  };

  const handleRemoveMember = (member: any) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const confirmRemoveMember = () => {
    if (memberToDelete) {
      console.log('Removing member:', memberToDelete.name);
      // Here you would typically remove the member via API
      alert(`${memberToDelete.name} has been removed from the team.`);
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm(prev => ({ ...prev, avatar: file }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'busy': return 'bg-amber-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getMemberTasks = (memberId: string) => {
    return tasks.filter(task => task.assignedTo === memberId);
  };

  const getMemberProjects = (memberId: string) => {
    return projects.filter(project => project.teamMembers.includes(memberId));
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getExpiryColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    if (daysLeft <= 3) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
    return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
  };

  return (
    <>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Team
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your team members and collaboration
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Invite Member</span>
          </motion.button>
        </motion.div>

        {/* Pending Invitations Section */}
        {pendingInvitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl p-6 border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-800' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pending Invitations
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}>
                  {pendingInvitations.length}
                </span>
              </div>
              <button
                onClick={loadPendingInvitations}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
                title="Refresh invitations"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingInvitations ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingInvitations.map((invitation, index) => {
                const daysLeft = getDaysUntilExpiry(invitation.expiresAt);
                return (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border transition-all ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {invitation.email}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1).replace('-', ' ')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpiryColor(daysLeft)}`}>
                        {daysLeft}d left
                      </span>
                    </div>

                    {invitation.message && (
                      <div className={`p-3 rounded-lg mb-3 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          "{invitation.message}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Sent {new Date(invitation.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleResendInvitation(invitation.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'text-blue-400 hover:bg-blue-900/20' 
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Resend invitation"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'text-red-400 hover:bg-red-900/20' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title="Cancel invitation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className={`mt-6 p-4 rounded-xl border ${
              isDarkMode 
                ? 'bg-blue-900/20 border-blue-700/50' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    Email Delivery Tips
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    <li>• Check spam/junk folders if emails aren't received</li>
                    <li>• Ensure your email service is properly configured</li>
                    <li>• Invitations expire after 7 days for security</li>
                    <li>• Use the resend button if the original email was missed</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => {
            const memberTasks = getMemberTasks(member.id);
            const memberProjects = getMemberProjects(member.id);
            const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`rounded-2xl p-6 border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-800 hover:border-gray-700' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                        isDarkMode ? 'border-gray-900' : 'border-white'
                      } ${getStatusColor(member.status)}`}></div>
                    </div>
                    <div>
                      <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {member.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === member.id ? null : member.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <MoreHorizontal className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    
                    <AnimatePresence>
                      {openDropdown === member.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-lg z-50 ${
                            isDarkMode 
                              ? 'bg-gray-800 border-gray-700' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="p-2">
                            <button
                              onClick={() => handleSendMessage(member)}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                isDarkMode 
                                  ? 'hover:bg-gray-700 text-gray-300' 
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Send Message</span>
                            </button>
                            <button
                              onClick={() => handleEditProfile(member)}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                isDarkMode 
                                  ? 'hover:bg-gray-700 text-gray-300' 
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <Edit3 className="w-4 h-4" />
                              <span className="text-sm font-medium">Edit Profile</span>
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                isDarkMode 
                                  ? 'hover:bg-red-900/20 text-red-400' 
                                  : 'hover:bg-red-50 text-red-600'
                              }`}
                            >
                              <UserMinus className="w-4 h-4" />
                              <span className="text-sm font-medium">Remove Member</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {member.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}></div>
                    <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {member.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {memberTasks.length}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Active Tasks
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {memberProjects.length}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Projects
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Task Completion</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => handleSendMessage(member)}
                    className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-xl transition-colors w-full ${
                      isDarkMode 
                        ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Send Message</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-900 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Invite Team Member
                  </h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Send an invitation to join your team
                  </p>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="colleague@company.com"
                    className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role
                  </label>
                  <select 
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                    className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                    <option value="project-manager">Project Manager</option>
                    <option value="qa">QA Engineer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Hi! I'd like to invite you to join our team. We're working on some exciting projects and would love to have you on board!"
                    rows={4}
                    className={`w-full p-4 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-blue-900/20 border-blue-700/50' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    What happens next?
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    <li>• They'll receive an email invitation</li>
                    <li>• They can accept and create their account</li>
                    <li>• You'll be notified when they join</li>
                    <li>• Invitations expire after 7 days</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-amber-900/20 border-amber-700/50' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                    Email Delivery Note
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-700'}`}>
                    If the recipient doesn't receive the email, ask them to check their spam/junk folder. 
                    You can also resend the invitation from the pending invitations section.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className={`px-6 py-3 rounded-xl transition-colors font-medium ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendInvite}
                  disabled={!inviteForm.email.trim() || isInviting}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isInviting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Message Modal */}
      <AnimatePresence>
        {showMessageModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-900 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Send Message to {selectedMember.name}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedMember.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter message subject..."
                    className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Message *
                  </label>
                  <textarea
                    value={messageForm.message}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Type your message here..."
                    rows={6}
                    className={`w-full p-4 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-emerald-900/20 border-emerald-700/50' 
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                      This message will be sent directly to {selectedMember.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className={`px-6 py-3 rounded-xl transition-colors font-medium ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitMessage}
                  disabled={!messageForm.subject.trim() || !messageForm.message.trim()}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && memberToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-900 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Edit Profile
                  </h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Update {memberToEdit.name}'s profile information
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={memberToEdit.avatar}
                    alt={memberToEdit.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Profile Picture
                    </label>
                    <label className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}>
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Upload New</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name..."
                    className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address..."
                    className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role *
                  </label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                    <option value="project-manager">Project Manager</option>
                    <option value="qa">QA Engineer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-amber-900/20 border-amber-700/50' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Edit3 className="w-4 h-4 text-amber-600" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                      Changes will be saved to {memberToEdit.name}'s profile
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`px-6 py-3 rounded-xl transition-colors font-medium ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateProfile}
                  disabled={!editForm.name.trim() || !editForm.email.trim() || !editForm.role.trim()}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Member Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && memberToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl p-8 shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-900 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-red-900/20' : 'bg-red-100'
                }`}>
                  <UserMinus className="w-8 h-8 text-red-500" />
                </div>
                
                <h2 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Remove Team Member
                </h2>
                
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <img
                    src={memberToDelete.avatar}
                    alt={memberToDelete.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {memberToDelete.name}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {memberToDelete.role}
                    </p>
                  </div>
                </div>
                
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Are you sure you want to remove this team member? They will lose access to all projects and their tasks will need to be reassigned.
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl transition-colors font-medium ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmRemoveMember}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    Remove
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Team;