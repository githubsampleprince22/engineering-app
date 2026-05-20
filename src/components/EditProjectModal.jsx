import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

const EditProjectModal = ({ isOpen, onClose, onSave, project, onDelete }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Residential');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setType(project.type);
      setBudget(project.budget || '');
    }
  }, [project, isOpen]);

  const projectTypes = [
    'Residential', 'Commercial', 'Industrial', 'Bridge', 'Highway', 'Infrastructure', 'Custom'
  ];

  const handleSave = () => {
    if (name.trim()) {
      onSave(project.id, { name, type, budget: parseFloat(budget) || 0 });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="ios-modal-overlay"
          style={{ zIndex: 1100 }}
        >
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="ios-modal"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Edit Project</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--system-blue)' }}>
                <X size={24} />
              </button>
            </div>

            <label style={{ display: 'block', fontSize: '13px', color: 'var(--system-gray)', marginBottom: '8px' }}>
              PROJECT NAME
            </label>
            <input 
              className="ios-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label style={{ display: 'block', fontSize: '13px', color: 'var(--system-gray)', marginBottom: '8px' }}>
              PROJECT BUDGET (₱)
            </label>
            <input 
              className="ios-input" 
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />

            <label style={{ display: 'block', fontSize: '13px', color: 'var(--system-gray)', marginBottom: '8px' }}>
              PROJECT TYPE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {projectTypes.map(ptype => (
                <button
                  key={ptype}
                  onClick={() => setType(ptype)}
                  className={`ios-segmented-control-item ${type === ptype ? 'active' : ''}`}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '10px',
                    background: type === ptype ? 'var(--system-blue)' : 'var(--system-gray-6)',
                    color: type === ptype ? 'white' : 'inherit'
                  }}
                >
                  {ptype}
                </button>
              ))}
            </div>

            <button 
              className="ios-btn-primary" 
              style={{ width: '100%', marginBottom: '12px' }}
              onClick={handleSave}
            >
              Save Changes
            </button>

            <button 
              className="ios-btn-secondary" 
              style={{ width: '100%', color: 'var(--system-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => {
                if (window.confirm('Move this folder to Trash?')) {
                  onDelete(project.id);
                  onClose();
                }
              }}
            >
              <Trash2 size={18} />
              Move to Trash
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProjectModal;
