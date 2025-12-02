import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, useAppData, Project } from '../App';
import { 
  FolderOpen, 
  Plus, 
  Calendar, 
  Users, 
  MoreHorizontal, 
  TrendingUp, 
  X, 
  Check,
  Edit3,
  Archive,
  Trash2,
  CheckCircle,
  Filter,
  RotateCcw
} from 'lucide-react';

const Projects: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { projects, teamMembers, addProject, updateProject, deleteProject } = useAppData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filterView, setFilterView] = useState<'active' | 'archived' | 'all'>('active');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    startDate: '',
    endDate: '',
    color: '#3B82F6'
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal, showEditModal]);

  const handleCreateProject = () => {
    if (newProject.name.trim() && newProject.description.trim()) {
      addProject({
        ...newProject,
        progress: 0,
        teamMembers: selectedTeamMembers
      });
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        color: '#3B82F6'
      });
      setSelectedTeamMembers([]);
      setShowCreateModal(false);
    }
  };

  const handleEditProject = () => {
    if (editingProject && newProject.name.trim() && newProject.description.trim()) {
      updateProject(editingProject.id, {
        ...newProject,
        teamMembers: selectedTeamMembers
      });
      setShowEditModal(false);
      setEditingProject(null);
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        color: '#3B82F6'
      });
      setSelectedTeamMembers([]);
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      color: project.color
    });
    setSelectedTeamMembers(project.teamMembers);
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const handleMarkCompleted = (project: Project) => {
    updateProject(project.id, { 
      status: 'completed',
      progress: 100
    });
    setOpenDropdown(null);
  };

  const handleArchiveProject = (project: Project) => {
    updateProject(project.id, { status: 'archived' as Project['status'] });
    setOpenDropdown(null);
  };

  const handleRestoreProject = (project: Project) => {
    updateProject(project.id, { status: 'active' as Project['status'] });
    setOpenDropdown(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(projectId);
      setOpenDropdown(null);
    }
  };

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getSelectedMemberNames = () => {
    return selectedTeamMembers
      .map(id => teamMembers.find(member => member.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'planning': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'on-hold': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'archived': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Filter projects based on selected view
  const displayedProjects = projects.filter(project => {
    switch (filterView) {
      case 'active':
        return project.status !== 'archived';
      case 'archived':
        return project.status === 'archived';
      case 'all':
        return true;
      default:
        return project.status !== 'archived';
    }
  });

  const getFilterLabel = () => {
    switch (filterView) {
      case 'active': return 'Active Projects';
      case 'archived': return 'Archived Projects';
      case 'all': return 'All Projects';
      default: return 'Active Projects';
    }
  };

  const getProjectCount = () => {
    const activeCount = projects.filter(p => p.status !== 'archived').length;
    const archivedCount = projects.filter(p => p.status === 'archived').length;
    
    switch (filterView) {
      case 'active': return `${activeCount} active`;
      case 'archived': return `${archivedCount} archived`;
      case 'all': return `${projects.length} total`;
      default: return `${activeCount} active`;
    }
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
              Projects
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and track your project progress
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={filterView}
                onChange={(e) => setFilterView(e.target.value as 'active' | 'archived' | 'all')}
                className={`px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-white' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              >
                <option value="active">Active Projects</option>
                <option value="archived">Archived Projects</option>
                <option value="all">All Projects</option>
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Filter Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`flex items-center justify-between p-4 rounded-xl border ${
            isDarkMode 
              ? 'bg-gray-900/50 border-gray-800' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${
              filterView === 'active' ? 'bg-emerald-500' : 
              filterView === 'archived' ? 'bg-purple-500' : 'bg-blue-500'
            }`}></div>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getFilterLabel()}
            </span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
            }`}>
              {getProjectCount()}
            </span>
          </div>
          
          {filterView === 'archived' && (
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Archived projects are hidden from active workflows
            </div>
          )}
        </motion.div>

        {displayedProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-16 rounded-2xl border ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-800' 
                : 'bg-white border-gray-200'
            }`}
          >
            <Archive className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filterView === 'archived' ? 'No archived projects' : 'No projects found'}
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {filterView === 'archived' 
                ? 'Projects you archive will appear here' 
                : 'Create your first project to get started'
              }
            </p>
            {filterView !== 'archived' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
              >
                Create Project
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer relative ${
                  project.status === 'archived'
                    ? isDarkMode
                      ? 'bg-gray-900/50 border-gray-800 opacity-75'
                      : 'bg-gray-50 border-gray-200 opacity-75'
                    : isDarkMode 
                      ? 'bg-gray-900 border-gray-800 hover:border-gray-700' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: project.color + '20' }}
                  >
                    <FolderOpen className="w-6 h-6" style={{ color: project.color }} />
                  </div>
                  <div className="relative" ref={openDropdown === project.id ? dropdownRef : null}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === project.id ? null : project.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <MoreHorizontal className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    
                    <AnimatePresence>
                      {openDropdown === project.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-lg z-50 ${
                            isDarkMode 
                              ? 'bg-gray-800 border-gray-700' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="py-2">
                            <button
                              onClick={() => openEditModal(project)}
                              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                                isDarkMode 
                                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit Project</span>
                            </button>
                            
                            {project.status === 'archived' ? (
                              <button
                                onClick={() => handleRestoreProject(project)}
                                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                                  isDarkMode 
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                              >
                                <RotateCcw className="w-4 h-4" />
                                <span>Restore Project</span>
                              </button>
                            ) : (
                              <>
                                {project.status !== 'completed' && (
                                  <button
                                    onClick={() => handleMarkCompleted(project)}
                                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                                      isDarkMode 
                                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Mark as Completed</span>
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleArchiveProject(project)}
                                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                                    isDarkMode 
                                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                  }`}
                                >
                                  <Archive className="w-4 h-4" />
                                  <span>Archive Project</span>
                                </button>
                              </>
                            )}
                            
                            <div className={`border-t my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                            
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Project</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {project.name}
                </h3>
                <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {project.description}
                </p>

                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {project.progress}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${project.progress}%`,
                        backgroundColor: project.color
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {project.teamMembers.length}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 99999 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-900 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Create New Project
                  </h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Set up a new project and assign team members
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name..."
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description *
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project goals and objectives..."
                    rows={4}
                    className={`w-full p-4 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject(prev => ({ ...prev, priority: e.target.value as Project['priority'] }))}
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Team Members
                  </label>
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    {selectedTeamMembers.length > 0 && (
                      <div className="mb-4">
                        <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Selected: {getSelectedMemberNames()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeamMembers.map(memberId => {
                            const member = teamMembers.find(m => m.id === memberId);
                            return member ? (
                              <div
                                key={memberId}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                                  isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-5 h-5 rounded-full"
                                />
                                <span>{member.name}</span>
                                <button
                                  onClick={() => toggleTeamMember(memberId)}
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  ×
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {teamMembers.map(member => (
                        <div
                          key={member.id}
                          onClick={() => toggleTeamMember(member.id)}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedTeamMembers.includes(member.id)
                              ? isDarkMode
                                ? 'bg-blue-900/50 border-2 border-blue-500'
                                : 'bg-blue-50 border-2 border-blue-500'
                              : isDarkMode
                                ? 'hover:bg-gray-700 border-2 border-transparent'
                                : 'hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {member.name}
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {member.role}
                            </p>
                          </div>
                          {selectedTeamMembers.includes(member.id) && (
                            <Check className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={newProject.color}
                      onChange={(e) => setNewProject(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div className="flex space-x-2">
                      {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'].map(color => (
                        <button
                          key={color}
                          onClick={() => setNewProject(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            newProject.color === color ? 'border-gray-400 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateModal(false)}
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
                  onClick={handleCreateProject}
                  disabled={!newProject.name.trim() || !newProject.description.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Create Project
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {showEditModal && editingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 99999 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-900 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Edit Project
                  </h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Update project details and team assignments
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name..."
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description *
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project goals and objectives..."
                    rows={4}
                    className={`w-full p-4 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject(prev => ({ ...prev, priority: e.target.value as Project['priority'] }))}
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                      className={`w-full p-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-gray-700 text-white' 
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Team Members
                  </label>
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    {selectedTeamMembers.length > 0 && (
                      <div className="mb-4">
                        <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Selected: {getSelectedMemberNames()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeamMembers.map(memberId => {
                            const member = teamMembers.find(m => m.id === memberId);
                            return member ? (
                              <div
                                key={memberId}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                                  isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-5 h-5 rounded-full"
                                />
                                <span>{member.name}</span>
                                <button
                                  onClick={() => toggleTeamMember(memberId)}
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  ×
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {teamMembers.map(member => (
                        <div
                          key={member.id}
                          onClick={() => toggleTeamMember(member.id)}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedTeamMembers.includes(member.id)
                              ? isDarkMode
                                ? 'bg-blue-900/50 border-2 border-blue-500'
                                : 'bg-blue-50 border-2 border-blue-500'
                              : isDarkMode
                                ? 'hover:bg-gray-700 border-2 border-transparent'
                                : 'hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {member.name}
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {member.role}
                            </p>
                          </div>
                          {selectedTeamMembers.includes(member.id) && (
                            <Check className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={newProject.color}
                      onChange={(e) => setNewProject(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div className="flex space-x-2">
                      {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'].map(color => (
                        <button
                          key={color}
                          onClick={() => setNewProject(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            newProject.color === color ? 'border-gray-400 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
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
                  onClick={handleEditProject}
                  disabled={!newProject.name.trim() || !newProject.description.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Update Project
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Projects;