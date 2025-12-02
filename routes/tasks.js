import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    // Get projects user has access to
    const userProjects = await Project.find({
      $or: [
        { owner: req.userId },
        { teamMembers: req.userId }
      ]
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task's project
    const project = await Project.findById(task.project._id);
    const hasAccess = project.owner.toString() === req.userId || 
                     project.teamMembers.includes(req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Task title is required'),
  body('project').isMongoId().withMessage('Valid project ID is required'),
  body('assignedTo').isMongoId().withMessage('Valid assignee ID is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user has access to the project
    const project = await Project.findById(req.body.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = project.owner.toString() === req.userId || 
                     project.teamMembers.includes(req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    const taskData = {
      ...req.body,
      createdBy: req.userId
    };

    const task = new Task(taskData);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task's project
    const project = await Project.findById(task.project);
    const hasAccess = project.owner.toString() === req.userId || 
                     project.teamMembers.includes(req.userId) ||
                     task.assignedTo.toString() === req.userId;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'name color')
     .populate('assignedTo', 'name email avatar')
     .populate('createdBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to delete this task
    const project = await Project.findById(task.project);
    const canDelete = project.owner.toString() === req.userId || 
                     task.createdBy.toString() === req.userId;

    if (!canDelete) {
      return res.status(403).json({ message: 'Only project owner or task creator can delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to task
router.post('/:id/comments', auth, [
  body('text').trim().isLength({ min: 1 }).withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    const project = await Project.findById(task.project);
    const hasAccess = project.owner.toString() === req.userId || 
                     project.teamMembers.includes(req.userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.comments.push({
      user: req.userId,
      text: req.body.text
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name avatar');

    res.json(updatedTask.comments);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;