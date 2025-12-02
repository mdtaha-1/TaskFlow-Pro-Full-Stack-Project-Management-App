import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://studymate:studymate123@cluster0.w3venfq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        password: 'password123',
        role: 'designer',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        status: 'online'
      },
      {
        name: 'Mike Chen',
        email: 'mike@company.com',
        password: 'password123',
        role: 'developer',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        status: 'online'
      },
      {
        name: 'Emily Davis',
        email: 'emily@company.com',
        password: 'password123',
        role: 'project-manager',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        status: 'busy'
      },
      {
        name: 'Alex Rodriguez',
        email: 'alex@company.com',
        password: 'password123',
        role: 'developer',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        status: 'offline'
      }
    ]);

    console.log('Created users');

    // Create projects
    const projects = await Project.create([
      {
        name: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design',
        status: 'active',
        priority: 'high',
        progress: 65,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-03-15'),
        teamMembers: [users[0]._id, users[1]._id, users[2]._id],
        owner: users[2]._id,
        color: '#3B82F6'
      },
      {
        name: 'Mobile App Development',
        description: 'Native iOS and Android app for customer engagement',
        status: 'planning',
        priority: 'medium',
        progress: 25,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-01'),
        teamMembers: [users[1]._id, users[3]._id],
        owner: users[2]._id,
        color: '#10B981'
      }
    ]);

    console.log('Created projects');

    // Create tasks
    await Task.create([
      {
        title: 'Design homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage',
        status: 'completed',
        priority: 'high',
        project: projects[0]._id,
        assignedTo: users[0]._id,
        createdBy: users[2]._id,
        dueDate: new Date('2024-01-25'),
        tags: ['design', 'ui/ux']
      },
      {
        title: 'Implement responsive navigation',
        description: 'Code the responsive navigation component with mobile menu',
        status: 'in-progress',
        priority: 'medium',
        project: projects[0]._id,
        assignedTo: users[1]._id,
        createdBy: users[2]._id,
        dueDate: new Date('2024-01-30'),
        tags: ['frontend', 'responsive']
      }
    ]);

    console.log('Created tasks');
    console.log('Seed data created successfully!');
    
    console.log('\n=== LOGIN CREDENTIALS ===');
    users.forEach(user => {
      console.log(`Email: ${user.email} | Password: password123 | Role: ${user.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();