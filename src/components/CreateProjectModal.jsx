import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Residential');
  const [budget, setBudget] = useState('');

  const projectTypes = [
    'Residential', 'Commercial', 'Industrial', 'Bridge', 'Highway', 'Infrastructure', 'Custom'
  ];

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, type, budget);
      setName('');
      setBudget('');
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
        >
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="ios-modal"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>New Project Folder</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--system-blue)' }}>
                <X size={24} />
              </button>
            </div>

            <label style={{ display: 'block', fontSize: '13px', color: 'var(--system-gray)', marginBottom: '8px', marginLeft: '4px' }}>
              PROJECT NAME
            </label>
            <input 
              className="ios-input" 
              placeholder="e.g. Sunset Villa" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <label style={{ display: 'block', fontSize: '13px', color: 'var(--system-gray)', marginBottom: '8px', marginLeft: '4px' }}>
              ESTIMATED BUDGET (₱)
            </label>
            <input 
              className="ios-input" 
              type="number"
              placeholder="e.g. 500000" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />

            <label style={{ display: 'block', fontSize: '13px', color: 'var(--system-gray)', marginBottom: '8px', marginLeft: '4px' }}>
              PROJECT TYPE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {projectTypes.map(ptype => (
                <button
                  key={ptype}
                  onClick={() => setType(ptype)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: type === ptype ? 'var(--system-blue)' : 'var(--system-gray-6)',
                    color: type === ptype ? 'white' : 'black',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  {ptype}
                </button>
              ))}
            </div>

            <button 
              className="ios-btn-primary" 
              style={{ width: '100%' }}
              onClick={handleSave}
            >
              Create Folder
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;
