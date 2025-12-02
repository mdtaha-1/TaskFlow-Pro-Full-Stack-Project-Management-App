import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import JoinTeam from './pages/JoinTeam';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface AppData {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  roles: Role[];
  permissions: Permission[];
  currentUser: TeamMember | null;
  notifications: Notification[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addRole: (role: Omit<Role, 'id' | 'userCount' | 'isDefault' | 'createdAt'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  endDate: string;
  teamMembers: string[];
  color: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  assignedTo: string;
  dueDate: string;
  tags: string[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

const AppDataContext = createContext<AppData | null>(null);

export const useTheme = () => useContext(ThemeContext);
export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};

// Check if user is authenticated
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  return { currentUser, setCurrentUser };
};

// Helper function to create user-specific localStorage keys
const getUserStorageKey = (userEmail: string, dataType: string): string => {
  // Create a safe key by replacing special characters
  const safeEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
  return `user_${safeEmail}_${dataType}`;
};

// Helper function to get user-specific data from localStorage
const getUserData = (userEmail: string, dataType: string, defaultValue: any) => {
  const key = getUserStorageKey(userEmail, dataType);
  const saved = localStorage.getItem(key);
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      console.log(`📦 Loaded ${dataType} for ${userEmail} (${Array.isArray(parsed) ? parsed.length : 'N/A'} items)`);
      return parsed;
    } catch (error) {
      console.error(`❌ Error parsing ${dataType} for ${userEmail}:`, error);
    }
  }
  
  console.log(`🆕 No saved ${dataType} for ${userEmail}, using default`);
  return defaultValue;
};

// Helper function to save user-specific data to localStorage
const saveUserData = (userEmail: string, dataType: string, data: any) => {
  const key = getUserStorageKey(userEmail, dataType);
  localStorage.setItem(key, JSON.stringify(data));
  console.log(`💾 Saved ${dataType} for ${userEmail} (${Array.isArray(data) ? data.length : 'N/A'} items)`);
};

function App() {
  const { currentUser } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Demo account emails - using useMemo to prevent recreation
  const demoAccountEmails = useMemo(() => [
    'sarah@company.com',
    'mike@company.com', 
    'emily@company.com',
    'alex@company.com'
  ], []);

  // Sample data - using useMemo to prevent recreation
  const sampleData = useMemo(() => ({
    projects: [
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design',
        status: 'active' as const,
        priority: 'high' as const,
        progress: 65,
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        teamMembers: ['1', '2', '3'],
        color: '#3B82F6',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'Native iOS and Android app for customer engagement',
        status: 'planning' as const,
        priority: 'medium' as const,
        progress: 25,
        startDate: '2024-02-01',
        endDate: '2024-06-01',
        teamMembers: ['2', '4'],
        color: '#10B981',
        createdAt: '2024-01-20T14:30:00Z'
      }
    ],
    tasks: [
      {
        id: '1',
        title: 'Design homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage',
        status: 'completed' as const,
        priority: 'high' as const,
        projectId: '1',
        assignedTo: '1',
        dueDate: '2024-01-25',
        tags: ['design', 'ui/ux'],
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Implement responsive navigation',
        description: 'Code the responsive navigation component with mobile menu',
        status: 'in-progress' as const,
        priority: 'medium' as const,
        projectId: '1',
        assignedTo: '2',
        dueDate: '2024-01-30',
        tags: ['frontend', 'responsive'],
        createdAt: '2024-01-16T09:15:00Z'
      }
    ],
    teamMembers: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        role: 'UI/UX Designer',
        roleId: 'developer',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        status: 'online' as const
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@company.com',
        role: 'Frontend Developer',
        roleId: 'developer',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        status: 'online' as const
      },
      {
        id: '3',
        name: 'Emily Davis',
        email: 'emily@company.com',
        role: 'Project Manager',
        roleId: 'project-manager',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        status: 'busy' as const
      },
      {
        id: '4',
        name: 'Alex Rodriguez',
        email: 'alex@company.com',
        role: 'Backend Developer',
        roleId: 'developer',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        status: 'offline' as const
      }
    ],
    notifications: [
      {
        id: '1',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Implement responsive navigation"',
        type: 'info' as const,
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        link: '/tasks'
      },
      {
        id: '2',
        title: 'Project Milestone Reached',
        message: 'Website Redesign project has reached 65% completion',
        type: 'success' as const,
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        link: '/projects'
      },
      {
        id: '3',
        title: 'Deadline Approaching',
        message: 'Task "Design homepage mockup" is due tomorrow',
        type: 'warning' as const,
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        link: '/tasks'
      },
      {
        id: '4',
        title: 'Team Member Joined',
        message: 'Alex Rodriguez has joined the team',
        type: 'info' as const,
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        link: '/team'
      },
      {
        id: '5',
        title: 'System Update',
        message: 'TaskFlow Pro has been updated to version 2.1.0',
        type: 'info' as const,
        read: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      }
    ],
    roles: [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full access to all features and settings',
        permissions: ['create_projects', 'edit_projects', 'delete_projects', 'view_projects', 'create_tasks', 'assign_tasks', 'update_tasks', 'delete_tasks', 'manage_users', 'manage_team', 'view_team', 'view_analytics', 'export_data', 'manage_settings', 'manage_roles'],
        userCount: 1,
        isDefault: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'project-manager',
        name: 'Project Manager',
        description: 'Can manage projects and assign tasks to team members',
        permissions: ['create_projects', 'edit_projects', 'view_projects', 'create_tasks', 'assign_tasks', 'update_tasks', 'manage_team', 'view_team', 'view_analytics'],
        userCount: 2,
        isDefault: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'developer',
        name: 'Developer',
        description: 'Can view and update assigned tasks',
        permissions: ['view_projects', 'update_tasks', 'view_team'],
        userCount: 3,
        isDefault: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to projects and tasks',
        permissions: ['view_projects', 'view_team'],
        userCount: 1,
        isDefault: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'unassigned',
        name: 'Unassigned',
        description: 'Default role for users without specific assignments',
        permissions: ['view_projects'],
        userCount: 0,
        isDefault: false,
        createdAt: new Date().toISOString()
      }
    ]
  }), []);

  // Initialize data based on user
  const initializeUserData = useMemo(() => {
    if (!currentUser) {
      return {
        projects: [],
        tasks: [],
        teamMembers: [],
        notifications: [],
        roles: sampleData.roles
      };
    }

    const isDemoAccount = demoAccountEmails.includes(currentUser.email);
    console.log('🔍 Initializing data for:', currentUser.email, '| Demo account:', isDemoAccount);

    // Function to get data for a specific key with user-specific storage
    const getData = (dataType: string, sampleValue: any, emptyValue: any) => {
      // Try to get user-specific data first
      const userData = getUserData(currentUser.email, dataType, null);
      
      if (userData !== null) {
        return userData;
      }

      // No user-specific data found - determine what to use based on account type
      if (isDemoAccount) {
        console.log(`🎯 Demo account - initializing sample ${dataType} (${sampleValue.length} items)`);
        saveUserData(currentUser.email, dataType, sampleValue);
        return sampleValue;
      } else {
        console.log(`🆕 New account - initializing empty ${dataType}`);
        saveUserData(currentUser.email, dataType, emptyValue);
        return emptyValue;
      }
    };

    return {
      projects: getData('projects', sampleData.projects, []),
      tasks: getData('tasks', sampleData.tasks, []),
      teamMembers: getData('teamMembers', sampleData.teamMembers, []),
      notifications: getData('notifications', sampleData.notifications, []),
      roles: getData('roles', sampleData.roles, sampleData.roles) // Always provide roles
    };
  }, [currentUser, demoAccountEmails, sampleData]);

  // State initialization
  const [projects, setProjects] = useState<Project[]>(initializeUserData.projects);
  const [tasks, setTasks] = useState<Task[]>(initializeUserData.tasks);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initializeUserData.teamMembers);
  const [notifications, setNotifications] = useState<Notification[]>(initializeUserData.notifications);
  const [roles, setRoles] = useState<Role[]>(initializeUserData.roles);

  // Update state when user changes
  useEffect(() => {
    console.log('👤 User changed, updating state...');
    setProjects(initializeUserData.projects);
    setTasks(initializeUserData.tasks);
    setTeamMembers(initializeUserData.teamMembers);
    setNotifications(initializeUserData.notifications);
    setRoles(initializeUserData.roles);
  }, [initializeUserData]);

  // Define permissions
  const permissions: Permission[] = [
    // Project Management
    { id: 'create_projects', name: 'Create Projects', description: 'Create new projects', category: 'Projects' },
    { id: 'edit_projects', name: 'Edit Projects', description: 'Modify existing projects', category: 'Projects' },
    { id: 'delete_projects', name: 'Delete Projects', description: 'Remove projects permanently', category: 'Projects' },
    { id: 'view_projects', name: 'View Projects', description: 'Access project information', category: 'Projects' },
    
    // Task Management
    { id: 'create_tasks', name: 'Create Tasks', description: 'Create new tasks', category: 'Tasks' },
    { id: 'assign_tasks', name: 'Assign Tasks', description: 'Assign tasks to team members', category: 'Tasks' },
    { id: 'update_tasks', name: 'Update Tasks', description: 'Modify task details and status', category: 'Tasks' },
    { id: 'delete_tasks', name: 'Delete Tasks', description: 'Remove tasks permanently', category: 'Tasks' },
    
    // Team Management
    { id: 'manage_users', name: 'Manage Users', description: 'Add, edit, and remove team members', category: 'Team' },
    { id: 'manage_team', name: 'Manage Team', description: 'View and organize team structure', category: 'Team' },
    { id: 'view_team', name: 'View Team', description: 'Access team member information', category: 'Team' },
    
    // Analytics & Reports
    { id: 'view_analytics', name: 'View Analytics', description: 'Access performance dashboards', category: 'Analytics' },
    { id: 'export_data', name: 'Export Data', description: 'Download reports and data', category: 'Analytics' },
    
    // System Settings
    { id: 'manage_settings', name: 'Manage Settings', description: 'Configure system settings', category: 'Settings' },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Create and modify user roles', category: 'Settings' }
  ];

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    if (currentUser) {
      saveUserData(currentUser.email, 'projects', updatedProjects);
    }
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(project => 
      project.id === id ? { ...project, ...updates } : project
    );
    setProjects(updatedProjects);
    if (currentUser) {
      saveUserData(currentUser.email, 'projects', updatedProjects);
    }
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    if (currentUser) {
      saveUserData(currentUser.email, 'projects', updatedProjects);
    }
    
    // Also remove tasks associated with this project
    const updatedTasks = tasks.filter(task => task.projectId !== id);
    setTasks(updatedTasks);
    if (currentUser) {
      saveUserData(currentUser.email, 'tasks', updatedTasks);
    }
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    if (currentUser) {
      saveUserData(currentUser.email, 'tasks', updatedTasks);
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    if (currentUser) {
      saveUserData(currentUser.email, 'tasks', updatedTasks);
    }
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    if (currentUser) {
      saveUserData(currentUser.email, 'tasks', updatedTasks);
    }
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString(),
    };
    const updatedMembers = [...teamMembers, newMember];
    setTeamMembers(updatedMembers);
    if (currentUser) {
      saveUserData(currentUser.email, 'teamMembers', updatedMembers);
    }

    // Update role user count
    const updatedRoles = roles.map(role => 
      role.id === member.roleId 
        ? { ...role, userCount: role.userCount + 1 }
        : role
    );
    setRoles(updatedRoles);
    if (currentUser) {
      saveUserData(currentUser.email, 'roles', updatedRoles);
    }
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    const currentMember = teamMembers.find(m => m.id === id);
    const updatedMembers = teamMembers.map(member => 
      member.id === id ? { ...member, ...updates } : member
    );
    setTeamMembers(updatedMembers);
    if (currentUser) {
      saveUserData(currentUser.email, 'teamMembers', updatedMembers);
    }

    // Update role user counts if roleId changed
    if (updates.roleId && currentMember && currentMember.roleId !== updates.roleId) {
      const updatedRoles = roles.map(role => {
        if (role.id === currentMember.roleId) {
          return { ...role, userCount: Math.max(0, role.userCount - 1) };
        }
        if (role.id === updates.roleId) {
          return { ...role, userCount: role.userCount + 1 };
        }
        return role;
      });
      setRoles(updatedRoles);
      if (currentUser) {
        saveUserData(currentUser.email, 'roles', updatedRoles);
      }
    }
  };

  const deleteTeamMember = (id: string) => {
    const memberToDelete = teamMembers.find(m => m.id === id);
    const updatedMembers = teamMembers.filter(member => member.id !== id);
    setTeamMembers(updatedMembers);
    if (currentUser) {
      saveUserData(currentUser.email, 'teamMembers', updatedMembers);
    }

    // Update role user count
    if (memberToDelete) {
      const updatedRoles = roles.map(role => 
        role.id === memberToDelete.roleId 
          ? { ...role, userCount: Math.max(0, role.userCount - 1) }
          : role
      );
      setRoles(updatedRoles);
      if (currentUser) {
        saveUserData(currentUser.email, 'roles', updatedRoles);
      }
    }

    // Reassign tasks to unassigned
    const updatedTasks = tasks.map(task => 
      task.assignedTo === id ? { ...task, assignedTo: 'unassigned' } : task
    );
    setTasks(updatedTasks);
    if (currentUser) {
      saveUserData(currentUser.email, 'tasks', updatedTasks);
    }
  };

  const addRole = (role: Omit<Role, 'id' | 'userCount' | 'isDefault' | 'createdAt'>) => {
    const newRole: Role = {
      ...role,
      id: Date.now().toString(),
      userCount: 0,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    if (currentUser) {
      saveUserData(currentUser.email, 'roles', updatedRoles);
    }
  };

  const updateRole = (id: string, updates: Partial<Role>) => {
    const updatedRoles = roles.map(role => 
      role.id === id ? { ...role, ...updates } : role
    );
    setRoles(updatedRoles);
    if (currentUser) {
      saveUserData(currentUser.email, 'roles', updatedRoles);
    }
  };

  const deleteRole = (id: string) => {
    const roleToDelete = roles.find(r => r.id === id);
    
    // Prevent deletion of default roles or roles with active users
    if (!roleToDelete || roleToDelete.isDefault || roleToDelete.userCount > 0) {
      return;
    }

    // Reassign team members to unassigned role
    const unassignedRoleId = roles.find(r => r.name === 'Unassigned')?.id || 'unassigned';
    const updatedMembers = teamMembers.map(member => 
      member.roleId === id ? { ...member, roleId: unassignedRoleId } : member
    );
    setTeamMembers(updatedMembers);
    if (currentUser) {
      saveUserData(currentUser.email, 'teamMembers', updatedMembers);
    }

    // Remove the role
    const updatedRoles = roles.filter(role => role.id !== id);
    setRoles(updatedRoles);
    if (currentUser) {
      saveUserData(currentUser.email, 'roles', updatedRoles);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    if (currentUser) {
      saveUserData(currentUser.email, 'notifications', updatedNotifications);
    }
  };

  const markNotificationAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    if (currentUser) {
      saveUserData(currentUser.email, 'notifications', updatedNotifications);
    }
  };

  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    if (currentUser) {
      saveUserData(currentUser.email, 'notifications', updatedNotifications);
    }
  };

  const appData: AppData = {
    projects,
    tasks,
    teamMembers,
    roles,
    permissions,
    currentUser,
    notifications,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addRole,
    updateRole,
    deleteRole,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <AppDataContext.Provider value={appData}>
        <Router>
          {!currentUser ? (
            // Public routes for unauthenticated users
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/join/:token" element={<JoinTeam />} />
              <Route path="*" element={<Landing />} />
            </Routes>
          ) : (
            // Authenticated app layout
            <div className={`min-h-screen transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-950 text-white' 
                : 'bg-gray-50 text-gray-900'
            }`}>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1 p-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="max-w-7xl mx-auto"
                    >
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Dashboard />} />
                      </Routes>
                    </motion.div>
                  </main>
                </div>
              </div>
            </div>
          )}
        </Router>
      </AppDataContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;