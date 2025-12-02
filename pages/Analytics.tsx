import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme, useAppData } from '../App';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Filter,
  Download,
  Calendar,
  Zap
} from 'lucide-react';

const Analytics: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { projects, tasks, teamMembers } = useAppData();
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeProjects = projects.filter(project => project.status === 'active').length;
  const completedProjects = projects.filter(project => project.status === 'completed').length;

  // Calculate project health
  const calculateProjectHealth = (project: any) => {
    const today = new Date();
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    const expectedProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    const progressDiff = project.progress - expectedProgress;
    
    if (project.status === 'completed') return 'completed';
    if (progressDiff >= 10) return 'ahead';
    if (progressDiff >= -10) return 'on-track';
    if (progressDiff >= -25) return 'at-risk';
    return 'delayed';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'completed': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'ahead': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on-track': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'at-risk': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      case 'delayed': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'completed': return CheckCircle;
      case 'ahead': return TrendingUp;
      case 'on-track': return CheckCircle;
      case 'at-risk': return AlertTriangle;
      case 'delayed': return AlertTriangle;
      default: return Clock;
    }
  };

  const getHealthLabel = (health: string) => {
    switch (health) {
      case 'completed': return 'Completed';
      case 'ahead': return 'Ahead of Schedule';
      case 'on-track': return 'On Track';
      case 'at-risk': return 'At Risk';
      case 'delayed': return 'Delayed';
      default: return 'Unknown';
    }
  };

  const projectHealthData = projects.map(project => ({
    ...project,
    health: calculateProjectHealth(project)
  }));

  const healthCounts = {
    completed: projectHealthData.filter(p => p.health === 'completed').length,
    ahead: projectHealthData.filter(p => p.health === 'ahead').length,
    'on-track': projectHealthData.filter(p => p.health === 'on-track').length,
    'at-risk': projectHealthData.filter(p => p.health === 'at-risk').length,
    delayed: projectHealthData.filter(p => p.health === 'delayed').length,
  };

  const tasksByPriority = {
    urgent: tasks.filter(task => task.priority === 'urgent').length,
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length,
  };

  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo').length,
    'in-progress': tasks.filter(task => task.status === 'in-progress').length,
    review: tasks.filter(task => task.status === 'review').length,
    completed: tasks.filter(task => task.status === 'completed').length,
  };

  const metrics = [
    { 
      icon: BarChart3, 
      label: 'Task Completion Rate', 
      value: `${completionRate}%`, 
      change: '+12%', 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      icon: Activity, 
      label: 'Active Projects', 
      value: activeProjects.toString(), 
      change: '+3', 
      color: 'from-emerald-500 to-teal-500' 
    },
    { 
      icon: Users, 
      label: 'Team Productivity', 
      value: '94%', 
      change: '+8%', 
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      icon: Target, 
      label: 'Projects On Track', 
      value: `${healthCounts['on-track'] + healthCounts.ahead}/${projects.length}`, 
      change: '+2', 
      color: 'from-amber-500 to-orange-500' 
    },
  ];

  const filteredProjects = selectedProject === 'all' 
    ? projectHealthData 
    : projectHealthData.filter(p => p.id === selectedProject);

  const exportData = () => {
    const data = {
      metrics,
      projectHealth: projectHealthData,
      taskDistribution: { tasksByPriority, tasksByStatus },
      teamPerformance: teamMembers.map(member => {
        const memberTasks = tasks.filter(task => task.assignedTo === member.id);
        const completedMemberTasks = memberTasks.filter(task => task.status === 'completed').length;
        return {
          name: member.name,
          role: member.role,
          totalTasks: memberTasks.length,
          completedTasks: completedMemberTasks,
          completionRate: memberTasks.length > 0 ? Math.round((completedMemberTasks / memberTasks.length) * 100) : 0
        };
      }),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
            Analytics Dashboard
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your team's performance and project insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className={`px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700 text-white' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportData}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
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
            <div className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-r ${metric.color}`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {metric.value}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {metric.label}
                </p>
              </div>
              <span className="text-emerald-500 text-sm font-semibold">{metric.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Health Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl p-6 border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Project Health Overview
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time status and timeline analysis
              </p>
            </div>
          </div>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className={`px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700 text-white' 
                : 'bg-gray-50 border border-gray-200 text-gray-900'
            }`}
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        {/* Health Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(healthCounts).map(([health, count]) => {
            const HealthIcon = getHealthIcon(health);
            return (
              <motion.div
                key={health}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`p-4 rounded-xl border text-center ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className={`inline-flex p-2 rounded-lg mb-2 ${getHealthColor(health)}`}>
                  <HealthIcon className="w-4 h-4" />
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {count}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getHealthLabel(health)}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          {filteredProjects.map((project, index) => {
            const HealthIcon = getHealthIcon(project.health);
            const today = new Date();
            const endDate = new Date(project.endDate);
            const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border transition-all hover:shadow-md ${
                  isDarkMode 
                    ? 'border-gray-700 hover:border-gray-600' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: project.color + '20' }}
                    >
                      <Target className="w-6 h-6" style={{ color: project.color }} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {project.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(project.health)}`}>
                    <HealthIcon className="w-4 h-4" />
                    <span>{getHealthLabel(project.health)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Progress
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`flex-1 h-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${project.progress}%`,
                            backgroundColor: project.color
                          }}
                        ></div>
                      </div>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {project.progress}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Timeline
                      </span>
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 
                       daysRemaining === 0 ? 'Due today' : 
                       `${Math.abs(daysRemaining)} days overdue`}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Team Size
                      </span>
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {project.teamMembers.length} members
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Priority
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.priority === 'urgent' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : project.priority === 'high'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : project.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Task Distribution by Priority
            </h2>
            <PieChart className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <div className="space-y-4">
            {Object.entries(tasksByPriority).map(([priority, count]) => {
              const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              const colors = {
                urgent: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-yellow-500',
                low: 'bg-gray-500'
              };
              
              return (
                <div key={priority} className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`capitalize font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {priority}
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${colors[priority as keyof typeof colors]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className={`rounded-2xl p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Task Status Overview
            </h2>
            <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <div className="space-y-4">
            {Object.entries(tasksByStatus).map(([status, count]) => {
              const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              const colors = {
                'todo': 'bg-gray-500',
                'in-progress': 'bg-blue-500',
                'review': 'bg-purple-500',
                'completed': 'bg-emerald-500'
              };
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`capitalize font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {status.replace('-', ' ')}
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${colors[status as keyof typeof colors]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Team Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className={`rounded-2xl p-6 border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}
      >
        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Team Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => {
            const memberTasks = tasks.filter(task => task.assignedTo === member.id);
            const completedMemberTasks = memberTasks.filter(task => task.status === 'completed').length;
            const memberCompletionRate = memberTasks.length > 0 ? Math.round((completedMemberTasks / memberTasks.length) * 100) : 0;
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className={`p-4 rounded-xl border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {member.name}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Task Completion
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {memberCompletionRate}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${memberCompletionRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                      {completedMemberTasks}/{memberTasks.length} tasks
                    </span>
                    <span className={`font-medium ${
                      memberCompletionRate >= 80 ? 'text-emerald-500' :
                      memberCompletionRate >= 60 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {memberCompletionRate >= 80 ? 'Excellent' :
                       memberCompletionRate >= 60 ? 'Good' : 'Needs Attention'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;