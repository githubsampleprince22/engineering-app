import React from 'react';
import { Folder, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectFolder = ({ project, onClick }) => {
  const totalSpent = project.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0) +
                     project.materials.reduce((sum, mat) => sum + (parseFloat(mat.price || 0) * parseFloat(mat.quantity || 1)), 0);

  return (
    <motion.div 
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(project)}
      className="ios-card"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer',
        aspectRatio: '1/1',
        padding: '12px'
      }}
    >
      <div style={{ position: 'relative' }}>
        <Folder size={64} color="var(--system-blue)" fill="var(--system-blue)" fillOpacity={0.1} />
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -10%)',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'var(--system-blue)',
          textAlign: 'center',
          maxWidth: '80%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {project.type.substring(0, 3).toUpperCase()}
        </div>
      </div>
      <div style={{ marginTop: '8px', textAlign: 'center', width: '100%' }}>
        <div style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {project.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--system-gray)' }}>
          ₱{totalSpent.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectFolder;
