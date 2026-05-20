import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a project (including restore, soft delete via 'deleted' flag)
router.put('/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Hard delete a project
router.delete('/:id/permanent', async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({ id: req.params.id });
    if (!deletedProject) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add an expense
router.post('/:id/expenses', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.expenses.push(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a material (project work)
router.post('/:id/materials', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.materials.push(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add an estimation
router.post('/:id/estimations', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.estimations.push(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an estimation
router.delete('/:id/estimations/:estimationId', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.estimations = project.estimations.filter(e => e.id !== req.params.estimationId);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add an actual
router.post('/:id/actuals', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.actuals.push(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Load Demo Project (batch replace or just add one)
router.post('/demo', async (req, res) => {
  try {
    const demoProject = new Project(req.body);
    const saved = await demoProject.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
