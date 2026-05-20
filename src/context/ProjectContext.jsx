import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

// Use the environment variable if available (Production), otherwise fallback to local proxy (Development)
const API_URL = import.meta.env.VITE_API_URL || '';

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (name, type, budget = 0) => {
    const newProject = {
      id: Date.now().toString(),
      name,
      type,
      createdAt: new Date().toISOString(),
      deleted: false,
      deletedAt: null,
      expenses: [],
      materials: [],
      estimations: [],
      actuals: [],
      budget: parseFloat(budget) || 0,
    };
    
    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (response.ok) {
        const savedProject = await response.json();
        setProjects([...projects, savedProject]);
        return savedProject;
      }
    } catch (error) {
      console.error('Error adding project:', error);
    }
    return null;
  };

  const updateProject = async (projectId, updates) => {
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (projectId) => {
    await updateProject(projectId, { deleted: true, deletedAt: new Date().toISOString() });
  };

  const restoreProject = async (projectId) => {
    await updateProject(projectId, { deleted: false, deletedAt: null });
  };

  const permanentDeleteProject = async (projectId) => {
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/permanent`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Error permanently deleting project:', error);
    }
  };

  const addExpense = async (projectId, expense) => {
    const newExpense = { ...expense, id: Date.now().toString(), date: expense.date || new Date().toISOString() };
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const addMaterial = async (projectId, material) => {
    const newMaterial = { ...material, id: Date.now().toString(), date: material.date || new Date().toISOString() };
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      });
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      }
    } catch (error) {
      console.error('Error adding material:', error);
    }
  };

  const addEstimation = async (projectId, estimation) => {
    const newEstimation = { ...estimation, id: Date.now().toString() };
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/estimations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEstimation)
      });
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      }
    } catch (error) {
      console.error('Error adding estimation:', error);
    }
  };

  const deleteEstimation = async (projectId, estimationId) => {
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/estimations/${estimationId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      }
    } catch (error) {
      console.error('Error deleting estimation:', error);
    }
  };

  const addActual = async (projectId, actual) => {
    const newActual = { ...actual, id: Date.now().toString(), date: actual.date || new Date().toISOString() };
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/actuals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActual)
      });
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      }
    } catch (error) {
      console.error('Error adding actual:', error);
    }
  };

  const loadDemoProject = async () => {
    const demoProject = {
      id: Date.now().toString(),
      name: 'Sample Villa Renovation',
      type: 'residential',
      createdAt: new Date().toISOString(),
      deleted: false,
      deletedAt: null,
      budget: 150000,
      expenses: [
        { id: 'l1', date: '2026-05-01', name: 'Electrician', quantity: 40, price: 500, total: 20000, type: 'labor', amount: 20000 },
        { id: 'l2', date: '2026-05-02', name: 'Plumber', quantity: 30, price: 450, total: 13500, type: 'labor', amount: 13500 },
        { id: 'l3', date: '2026-05-03', name: 'Carpentry Team', quantity: 80, price: 400, total: 32000, type: 'labor', amount: 32000 },
      ],
      materials: [
        { id: 'pw1', date: '2026-05-01', name: 'Site Preparation & Demolition', percentage: 100, amount: 15000, type: 'materials' },
        { id: 'pw2', date: '2026-05-03', name: 'Foundation Works', percentage: 80, amount: 25000, type: 'materials' },
        { id: 'pw3', date: '2026-05-05', name: 'Masonry (Walls)', percentage: 40, amount: 12000, type: 'materials' }
      ],
      estimations: [
        { id: 'e1', name: 'Electrician', quantity: 50, price: 500, unit: 'hrs', total: 25000, type: 'labor' },
        { id: 'e2', name: 'Plumber', quantity: 25, price: 450, unit: 'hrs', total: 11250, type: 'labor' },
        { id: 'e3', name: 'Carpentry Team', quantity: 70, price: 400, unit: 'hrs', total: 28000, type: 'labor' },
        { id: 'e4', name: 'Portland Cement', quantity: 100, price: 250, unit: 'bags', total: 25000, type: 'materials' },
        { id: 'e5', name: 'Hollow Blocks', quantity: 1000, price: 15, unit: 'pcs', total: 15000, type: 'materials' },
        { id: 'e6', name: 'River Sand', quantity: 15, price: 800, unit: 'cu.m', total: 12000, type: 'materials' },
        { id: 'e7', name: 'Deformed Steel Bars (10mm)', quantity: 100, price: 180, unit: 'pcs', total: 18000, type: 'materials' },
      ],
      actuals: [
        { id: 'a1', date: '2026-05-01', name: 'Electrician', quantity: 40, price: 500, unit: 'hrs', total: 20000 },
        { id: 'a2', date: '2026-05-02', name: 'Plumber', quantity: 30, price: 450, unit: 'hrs', total: 13500 },
        { id: 'a3', date: '2026-05-03', name: 'Carpentry Team', quantity: 80, price: 400, unit: 'hrs', total: 32000 },
        { id: 'a4', date: '2026-05-01', name: 'Portland Cement', quantity: 110, price: 250, unit: 'bags', total: 27500 },
        { id: 'a5', date: '2026-05-03', name: 'Hollow Blocks', quantity: 950, price: 15, unit: 'pcs', total: 14250 },
        { id: 'a6', date: '2026-05-05', name: 'River Sand', quantity: 12, price: 800, unit: 'cu.m', total: 9600 },
        { id: 'a7', date: '2026-05-06', name: 'Deformed Steel Bars (10mm)', quantity: 100, price: 180, unit: 'pcs', total: 18000 }
      ]
    };
    
    try {
      const response = await fetch(`${API_URL}/api/projects/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoProject)
      });
      if (response.ok) {
        const savedProject = await response.json();
        setProjects([...projects, savedProject]);
        return savedProject;
      }
    } catch (error) {
      console.error('Error loading demo project:', error);
    }
    return null;
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      addProject,
      updateProject,
      deleteProject,
      restoreProject,
      permanentDeleteProject,
      addExpense,
      addMaterial,
      addEstimation,
      deleteEstimation,
      addActual,
      loadDemoProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
