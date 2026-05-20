import React, { useState } from 'react';
import { useProjects, ProjectProvider } from './context/ProjectContext';
import ProjectFolder from './components/ProjectFolder';
import CreateProjectModal from './components/CreateProjectModal';
import ProjectDetail from './components/ProjectDetail';
import { Plus, LayoutDashboard, Settings, User, Trash2, RefreshCw, X, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { projects, addProject, restoreProject, permanentDeleteProject, loadDemoProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTrash, setShowTrash] = useState(false);

  const activeProjects = projects.filter(p => !p.deleted);
  const deletedProjects = projects.filter(p => p.deleted);

  return (
    <div style={{ paddingBottom: '100px' }}>
      <header className="ios-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="ios-title">{showTrash ? 'Trash' : 'Projects'}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowTrash(!showTrash)}
              style={{ background: 'none', border: 'none', color: showTrash ? 'var(--system-blue)' : 'var(--system-gray)', padding: '8px' }}
            >
              <Trash2 size={24} />
            </button>
            {!showTrash && (
              <button 
                onClick={() => setIsModalOpen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--system-blue)', padding: '8px' }}
              >
                <Plus size={28} />
              </button>
            )}
          </div>
        </div>
        <p className="ios-subtitle">{showTrash ? `${deletedProjects.length} Deleted` : `${activeProjects.length} Folders`}</p>
      </header>

      <main style={{ padding: '16px' }}>
        {showTrash ? (
          <div>
            {deletedProjects.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--system-gray)' }}>
                <Trash2 size={64} style={{ opacity: 0.3, marginBottom: '16px', color: '#ffffff' }} />
                <p style={{ color: '#ffffff', opacity: 0.7 }}>Trash is empty</p>
                <button className="ios-btn-secondary" onClick={() => setShowTrash(false)}>Go Back</button>
              </div>
            ) : (
              <div>
                {deletedProjects.map(project => (
                  <div key={project.id} className="ios-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Folder size={32} color="var(--system-gray)" />
                      <div>
                        <div style={{ fontWeight: '600' }}>{project.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--system-gray)' }}>Deleted on {new Date(project.deletedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => restoreProject(project.id)}
                        style={{ background: 'var(--system-gray-6)', border: 'none', borderRadius: '50%', p: '8px', color: 'var(--system-blue)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Permanently delete this folder?')) permanentDeleteProject(project.id) }}
                        style={{ background: 'var(--system-gray-6)', border: 'none', borderRadius: '50%', p: '8px', color: 'var(--system-red)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {activeProjects.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--system-gray)' }}>
                <LayoutDashboard size={64} style={{ opacity: 0.3, marginBottom: '16px', color: '#ffffff' }} />
                <p style={{ color: '#ffffff', opacity: 0.7 }}>No project folders yet.</p>
                <button className="ios-btn-primary" onClick={() => setIsModalOpen(true)}>
                  Create First Folder
                </button>
                <div style={{ marginTop: '16px' }}>
                  <button className="ios-btn-secondary" onClick={async () => {
                    const demo = await loadDemoProject();
                    if (demo) setSelectedProject(demo);
                  }}>
                    Load Sample Demo
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                {activeProjects.map(project => (
                  <ProjectFolder key={project.id} project={project} onClick={setSelectedProject} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={addProject} 
      />

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

      <nav className="ios-tab-bar">
        <button onClick={() => setShowTrash(false)} className={`ios-tab-item ${!showTrash ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <LayoutDashboard size={24} />
          <span>Projects</span>
        </button>
        <button onClick={() => setShowTrash(true)} className={`ios-tab-item ${showTrash ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={24} />
          <span>Trash</span>
        </button>
        <div className="ios-tab-item">
          <Settings size={24} />
          <span>Settings</span>
        </div>
      </nav>
    </div>
  );
};

const App = () => {
  return (
    <ProjectProvider>
      <Dashboard />
    </ProjectProvider>
  );
};

export default App;
