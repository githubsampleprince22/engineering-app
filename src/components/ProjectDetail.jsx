import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, BarChart3, Receipt, Package, LayoutDashboard, Edit2, Trash2 } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import AnalyticsView from './AnalyticsView';
import EditProjectModal from './EditProjectModal';

const ProjectDetail = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { addExpense, addMaterial, addEstimation, deleteEstimation, updateProject, deleteProject, addActual } = useProjects();

  const [newItem, setNewItem] = useState({ name: '', amount: '', quantity: '1', price: '', unit: '', percentage: '', date: new Date().toISOString().split('T')[0] });

  const compileActuals = (actuals) => {
    const grouped = actuals.reduce((acc, curr) => {
      const name = curr.name.toLowerCase().trim();
      if (!acc[name]) {
        acc[name] = {
          name: curr.name,
          unit: curr.unit || '',
          quantity: 0,
          totalCost: 0,
          latestDate: curr.date || new Date().toISOString(),
          entries: 0
        };
      }
      const qty = parseFloat(curr.quantity || 0);
      const price = parseFloat(curr.price || 0);
      acc[name].quantity += qty;
      acc[name].totalCost += (qty * price);
      acc[name].entries += 1;
      if (curr.date && new Date(curr.date) > new Date(acc[name].latestDate)) {
        acc[name].latestDate = curr.date;
      }
      return acc;
    }, {});

    return Object.values(grouped).map(item => ({
      ...item,
      avgPrice: item.quantity > 0 ? item.totalCost / item.quantity : 0
    })).sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate));
  };

  const totalExpenses = project.expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalMaterials = project.materials.reduce((sum, m) => sum + (parseFloat(m.amount) || (parseFloat(m.price || 0) * parseFloat(m.quantity || 1))), 0);
  const totalSpent = totalExpenses + totalMaterials;

  const handleAddItem = () => {
    // If user cleared date, fallback to today
    const selectedDate = newItem.date ? new Date(newItem.date).toISOString() : new Date().toISOString();
    
    if (activeTab === 'expenses') {
      addExpense(project.id, { name: newItem.name, amount: newItem.amount, date: selectedDate });
    } else if (activeTab === 'materials') {
      addMaterial(project.id, { name: newItem.name, percentage: newItem.percentage, amount: newItem.amount, date: selectedDate });
    } else if (activeTab === 'estimations') {
      addEstimation(project.id, { name: newItem.name, quantity: newItem.quantity, price: newItem.price, unit: newItem.unit, date: selectedDate });
    } else if (activeTab === 'actual') {
      addActual(project.id, { name: newItem.name, quantity: newItem.quantity, price: newItem.price, unit: newItem.unit, date: selectedDate });
    }
    setNewItem({ name: '', amount: '', quantity: '1', price: '', unit: '', percentage: '', date: new Date().toISOString().split('T')[0] });
    setShowAddModal(false);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--ios-bg)', zIndex: 500, overflowY: 'auto', paddingBottom: '100px' }}
    >
      <div className="ios-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--system-blue)', padding: 0 }}>
            <ArrowLeft size={28} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', margin: 0 }}>{project.name}</h1>
            <div style={{ fontSize: '14px', color: 'var(--system-gray)' }}>{project.type} Project</div>
          </div>
        </div>
        <button onClick={() => setShowEditModal(true)} style={{ background: 'none', border: 'none', color: 'var(--system-blue)' }}>
          <Edit2 size={20} />
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Tabs - Fixed visibility with new CSS classes */}
        <div className="ios-segmented-control" style={{ overflowX: 'auto', display: 'flex', whiteSpace: 'nowrap' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'materials', label: 'Project Works' },
            { id: 'expenses', label: 'Labor' },
            { id: 'estimations', label: 'Estimate' },
            { id: 'actual', label: 'Actual' },
            { id: 'analytics', label: 'Analytics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ios-segmented-control-item ${activeTab === tab.id ? 'active' : ''}`}
              style={{ fontSize: '12px', flexShrink: 0, padding: '6px 12px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="ios-card" style={{ background: totalSpent > project.budget && project.budget > 0 ? 'var(--system-red)' : 'var(--system-blue)', color: 'white', transition: '0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ opacity: 0.8, fontSize: '14px' }}>Total Investment</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>₱{totalSpent.toLocaleString()}</div>
                </div>
                {project.budget > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ opacity: 0.8, fontSize: '14px' }}>Budget</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>₱{project.budget.toLocaleString()}</div>
                  </div>
                )}
              </div>
              
              {project.budget > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', opacity: 0.9 }}>
                    <span>Budget Usage</span>
                    <span>{Math.round((totalSpent / project.budget) * 100)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${Math.min((totalSpent / project.budget) * 100, 100)}%`, 
                        height: '100%', 
                        background: totalSpent > project.budget ? '#ffcc00' : 'white',
                        transition: 'width 0.5s ease-out'
                      }} 
                    />
                  </div>
                  {totalSpent > project.budget && (
                    <div style={{ fontSize: '11px', marginTop: '8px', fontWeight: '600', color: '#ffcc00' }}>
                      ⚠️ BUDGET EXCEEDED BY ₱{(totalSpent - project.budget).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px' }}>
                <div>Project Works: ₱{totalMaterials.toLocaleString()}</div>
                <div>Labor: ₱{totalExpenses.toLocaleString()}</div>
              </div>
            </div>

            <h3 style={{ fontSize: '17px', margin: '24px 0 12px 4px' }}>Recent Activity</h3>
            {[...project.materials, ...project.expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(item => (
              <div key={item.id} className="ios-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--system-gray)' }}>{new Date(item.date).toLocaleDateString()}</div>
                </div>
                <div style={{ fontWeight: '600', color: item.amount ? 'var(--system-red)' : 'var(--system-orange)' }}>
                  ₱{(item.amount || (parseFloat(item.price) * parseFloat(item.quantity))).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'materials' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Project Works Progress</h3>
              <button className="ios-btn-secondary" style={{ padding: '6px 12px', fontSize: '14px' }} onClick={() => setShowAddModal(true)}>
                <Plus size={16} style={{ marginRight: '4px' }} /> Add
              </button>
            </div>
            
            <div className="ios-card" style={{ padding: 0, overflow: 'hidden', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
                <thead>
                  <tr style={{ background: 'var(--system-gray-6)', color: 'var(--system-gray)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500' }}>Activity</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Completed</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {project.materials.map(mat => (
                    <tr key={mat.id} style={{ borderTop: '1px solid var(--system-gray-5)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--system-gray)' }}>{new Date(mat.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>{mat.name}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {mat.percentage ? `${mat.percentage}%` : (mat.quantity ? `${mat.quantity} ${mat.unit || ''}` : '-')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>
                        ₱{(parseFloat(mat.amount) || (parseFloat(mat.price) * parseFloat(mat.quantity))).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!project.materials || project.materials.length === 0) && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--system-gray)' }}>No project works recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Labor Expenses</h3>
              <button className="ios-btn-secondary" style={{ padding: '6px 12px', fontSize: '14px' }} onClick={() => setShowAddModal(true)}>
                <Plus size={16} style={{ marginRight: '4px' }} /> Add
              </button>
            </div>
            {project.expenses.map(exp => (
              <div key={exp.id} className="ios-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{exp.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--system-gray)' }}>{new Date(exp.date).toLocaleDateString()}</div>
                </div>
                <div style={{ fontWeight: '700' }}>₱{parseFloat(exp.amount).toLocaleString()}</div>
              </div>
            ))}
            {project.expenses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--system-gray)' }}>
                No expenses recorded yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'estimations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Estimates</h3>
              <button className="ios-btn-secondary" style={{ padding: '6px 12px', fontSize: '14px' }} onClick={() => setShowAddModal(true)}>
                <Plus size={16} style={{ marginRight: '4px' }} /> Add
              </button>
            </div>
            {(project.estimations || []).map(est => (
              <div key={est.id} className="ios-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{est.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--system-gray)' }}>
                    {est.quantity} {est.unit || 'units'} {est.price ? `@ ₱${est.price}` : ''}
                  </div>
                </div>
                {est.price && (
                  <div style={{ fontWeight: '700', marginRight: '16px' }}>
                    ₱{(parseFloat(est.quantity || 0) * parseFloat(est.price || 0)).toLocaleString()}
                  </div>
                )}
                <button 
                  onClick={() => deleteEstimation(project.id, est.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--system-red)', padding: '8px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(project.estimations || []).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--system-gray)' }}>
                No estimations added yet. Add items you expect to use for this project.
              </div>
            )}
          </div>
        )}

        {activeTab === 'actual' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Actual Usage</h3>
            </div>
            
            <div className="ios-card" style={{ padding: 0, overflow: 'hidden', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
                <thead>
                  <tr style={{ background: 'var(--system-gray-6)', color: 'var(--system-gray)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500' }}>Item</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Qty</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {compileActuals(project.actuals || []).map((act, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--system-gray-5)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--system-gray)' }}>{new Date(act.latestDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>{act.name}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>{act.quantity} <span style={{ fontSize: '11px', color: 'var(--system-gray)' }}>{act.unit}</span></td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>₱{act.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: 'var(--system-blue)' }}>₱{act.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!project.actuals || project.actuals.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--system-gray)' }}>No actuals recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button className="ios-btn-primary" style={{ width: '100%' }} onClick={() => setShowAddModal(true)}>
                <Plus size={16} style={{ marginRight: '8px', display: 'inline' }} /> Add Actual Entry
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView project={project} />
        )}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ios-modal-overlay" style={{ zIndex: 1001 }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="ios-modal">
              <h3>Add {activeTab === 'expenses' ? 'Labor' : activeTab === 'estimations' ? 'Estimate' : activeTab === 'actual' ? 'Actual' : 'Project Work'}</h3>
              
              {activeTab !== 'estimations' && (
                <input 
                  className="ios-input" 
                  type="date"
                  value={newItem.date} 
                  onChange={e => setNewItem({...newItem, date: e.target.value})} 
                />
              )}
              
              <input 
                className="ios-input" 
                placeholder={activeTab === 'materials' ? "Activity (e.g. Wall Painting)" : "Item Name (e.g. Cement)"} 
                value={newItem.name} 
                onChange={e => setNewItem({...newItem, name: e.target.value})} 
              />
              {activeTab === 'expenses' ? (
                <input 
                  className="ios-input" 
                  type="number" 
                  placeholder="Amount (₱)" 
                  value={newItem.amount} 
                  onChange={e => setNewItem({...newItem, amount: e.target.value})} 
                />
              ) : activeTab === 'materials' ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input 
                    className="ios-input" 
                    type="number" 
                    placeholder="Percentage (%)" 
                    style={{ flex: 1, minWidth: '60px' }}
                    value={newItem.percentage} 
                    onChange={e => {
                      const perc = e.target.value;
                      let calculatedAmount = newItem.amount;
                      if (perc !== '' && project.budget > 0) {
                        calculatedAmount = Math.round(project.budget * (parseFloat(perc) / 100)).toString();
                      }
                      setNewItem({...newItem, percentage: perc, amount: calculatedAmount});
                    }} 
                  />
                  <input 
                    className="ios-input" 
                    type="number" 
                    placeholder="Cost (₱)" 
                    style={{ flex: 1, minWidth: '100px' }}
                    value={newItem.amount} 
                    onChange={e => setNewItem({...newItem, amount: e.target.value})} 
                  />
                </div>
              ) : activeTab === 'estimations' ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input 
                    className="ios-input" 
                    type="number" 
                    placeholder="Est. Qty" 
                    style={{ flex: 1, minWidth: '60px' }}
                    value={newItem.quantity} 
                    onChange={e => setNewItem({...newItem, quantity: e.target.value})} 
                  />
                  <input 
                    className="ios-input" 
                    placeholder="Unit (e.g. kg)" 
                    style={{ flex: 1, minWidth: '60px' }}
                    value={newItem.unit} 
                    onChange={e => setNewItem({...newItem, unit: e.target.value})} 
                  />
                  <input 
                    className="ios-input" 
                    type="number" 
                    placeholder="Est. Price (₱)" 
                    style={{ flex: 2, minWidth: '100px' }}
                    value={newItem.price} 
                    onChange={e => setNewItem({...newItem, price: e.target.value})} 
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input 
                    className="ios-input" 
                    type="number" 
                    placeholder="Qty" 
                    style={{ flex: 1, minWidth: '60px' }}
                    value={newItem.quantity} 
                    onChange={e => setNewItem({...newItem, quantity: e.target.value})} 
                  />
                  <input 
                    className="ios-input" 
                    placeholder="Unit (e.g. kg)" 
                    style={{ flex: 1, minWidth: '60px' }}
                    value={newItem.unit} 
                    onChange={e => setNewItem({...newItem, unit: e.target.value})} 
                  />
                  <input 
                    className="ios-input" 
                    type="number" 
                    placeholder="Price (₱)" 
                    style={{ flex: 2, minWidth: '100px' }}
                    value={newItem.price} 
                    onChange={e => setNewItem({...newItem, price: e.target.value})} 
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="ios-btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="ios-btn-primary" style={{ flex: 1 }} onClick={handleAddItem}>Add Item</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditProjectModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onSave={updateProject} 
        onDelete={(id) => {
          deleteProject(id);
          onBack(); // Go back to dashboard after deleting
        }}
        project={project} 
      />
    </motion.div>
  );
};

export default ProjectDetail;
