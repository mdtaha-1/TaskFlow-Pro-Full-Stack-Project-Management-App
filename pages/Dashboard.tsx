import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, useAppData } from '../App';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Users,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { projects, tasks, teamMembers, currentUser } = useAppData();
  const navigate = useNavigate();

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const onlineMembers = teamMembers.filter(m => m.status === 'online').length;

  const stats = [
    { 
      icon: FolderOpen, 
      label: 'Active Projects', 
      value: activeProjects.toString(), 
      change: '+12%', 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      icon: CheckCircle, 
      label: 'Completed Tasks', 
      value: completedTasks.toString(), 
      change: '+8%', 
      color: 'from-emerald-500 to-teal-500' 
    },
    { 
      icon: Users, 
      label: 'Team Members', 
      value: onlineMembers.toString() + '/' + teamMembers.length, 
      change: 'Online', 
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      icon: Clock, 
      label: 'Task Completion', 
      value: Math.round((completedTasks / totalTasks) * 100) + '%', 
      change: '+15%', 
      color: 'from-amber-500 to-orange-500' 
    },
  ];

  const recentTasks = tasks.slice(-4).reverse();
  const upcomingDeadlines = tasks
    .filter(task => new Date(task.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const quickActions = [
    { 
      icon: FolderOpen, 
      label: 'New Project', 
      desc: 'Start a new project', 
      path: '/projects',
      color: 'text-blue-600'
    },
    { 
      icon: CheckCircle, 
      label: 'Add Task', 
      desc: 'Create a new task', 
      path: '/tasks',
      color: 'text-emerald-600'
    },
    { 
      icon: Users, 
      label: 'Invite Team', 
      desc: 'Add team members', 
      path: '/team',
      color: 'text-purple-600'
    },
    { 
      icon: BarChart3, 
      label: 'View Analytics', 
      desc: 'Check performance', 
      path: '/analytics',
      color: 'text-amber-600'
    }
  ];

  // Get the user's first name for greeting
  const getUserFirstName = () => {
    if (!currentUser) return 'there';
    const firstName = currentUser.name.split(' ')[0];
    return firstName;
  };

  // Get appropriate greeting based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getTimeBasedGreeting()}, {getUserFirstName()}!
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Here's what's happening with your projects today.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/projects')}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
        >
          <FolderOpen className="w-5 h-5" />
          <span>New Project</span>
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`rounded-2xl p-6 border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-800' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-r ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
              </div>
              <span className="text-emerald-500 text-sm font-semibold">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`lg:col-span-2 rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Tasks
            </h2>
            <button 
              onClick={() => navigate('/tasks')}
              className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentTasks.length > 0 ? recentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  task.status === 'completed' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : task.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'urgent' 
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'high'
                    ? 'bg-orange-100 text-orange-700'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {task.priority}
                </span>
              </motion.div>
            )) : (
              <div className="text-center py-8">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No tasks yet. Create your first task!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <div className={`rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Deadlines
              </h3>
              <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
              {upcomingDeadlines.length === 0 && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No upcoming deadlines
                </p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Team Performance</h3>
              <BarChart3 className="w-5 h-5 opacity-80" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Tasks Completed</span>
                <span className="text-sm font-semibold">{completedTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Active Projects</span>
                <span className="text-sm font-semibold">{activeProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Team Efficiency</span>
                <span className="text-sm font-semibold">94%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => navigate(action.path)}
            className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 group ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-800 hover:border-blue-500' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <action.icon className={`w-8 h-8 ${action.color} mb-4 group-hover:scale-110 transition-transform`} />
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {action.label}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {action.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Dashboard;