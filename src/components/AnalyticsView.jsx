import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell
} from 'recharts';

const AnalyticsView = ({ project }) => {
  const [activeChart, setActiveChart] = useState('estimated');

  // Aggregate actual quantities from actuals
  const actualUsage = (project.actuals || []).reduce((acc, mat) => {
    const name = mat.name.toLowerCase().trim();
    acc[name] = (acc[name] || 0) + parseFloat(mat.quantity || 0);
    return acc;
  }, {});

  const groupedActuals = Object.values((project.actuals || []).reduce((acc, curr) => {
    const name = curr.name.toLowerCase().trim();
    if (!acc[name]) {
      acc[name] = { name: curr.name, unit: curr.unit, quantity: 0, totalCost: 0, avgPrice: 0 };
    }
    const qty = parseFloat(curr.quantity || 0);
    const price = parseFloat(curr.price || 0);
    acc[name].quantity += qty;
    acc[name].totalCost += (qty * price);
    acc[name].avgPrice = acc[name].quantity > 0 ? acc[name].totalCost / acc[name].quantity : 0;
    return acc;
  }, {}));

  const estimateData = project.estimations || [];

  const comparisonData = estimateData.map(est => {
    const nameKey = est.name.toLowerCase().trim();
    const actual = groupedActuals.find(a => a.name.toLowerCase().trim() === nameKey) || { quantity: 0, totalCost: 0 };
    const estQty = parseFloat(est.quantity || 0);
    const actQty = actual.quantity;
    const estTotal = estQty * parseFloat(est.price || 0);
    const actTotal = actual.totalCost;
    
    return {
      name: est.name,
      unit: est.unit || '',
      estQty,
      actQty,
      qtyVariance: estQty - actQty,
      estTotal,
      actTotal,
      costVariance: estTotal - actTotal
    };
  });

  // Prepare data for Bar Chart
  const barData = estimateData.map(est => {
    const name = est.name.toLowerCase().trim();
    const actual = actualUsage[name] || 0;
    const estimated = parseFloat(est.quantity || 0);
    return {
      name: est.name,
      estimated: estimated,
      actual: actual,
      isExceeded: actual > estimated
    };
  });

  // Data for Spending over time
  const timelineData = [...(project.materials || []), ...(project.expenses || [])]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, item) => {
      const date = new Date(item.date).toLocaleDateString();
      const amount = item.amount ? parseFloat(item.amount) : (parseFloat(item.price) * parseFloat(item.quantity));
      
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.amount += amount;
      } else {
        acc.push({ date, amount });
      }
      return acc;
    }, []);

  const totalSpent = timelineData.reduce((sum, item) => sum + item.amount, 0);
  const budget = parseFloat(project.budget || 0);

  return (
    <div style={{ paddingBottom: '20px' }}>
      {budget > 0 && (
        <div className="ios-card">
          <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--system-gray)' }}>BUDGET UTILIZATION (₱)</h4>
          <div style={{ height: '180px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[{ name: 'Budget', spent: totalSpent, budget: budget }]}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--system-gray-5)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip 
                  formatter={(value) => `₱${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="budget" fill="var(--system-gray-5)" radius={[0, 4, 4, 0]} name="Total Budget" barSize={30} />
                <Bar dataKey="spent" fill={totalSpent > budget ? 'var(--system-red)' : 'var(--system-blue)'} radius={[0, 4, 4, 0]} name="Actual Spent" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--system-gray)' }}>Total Spent</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: totalSpent > budget ? 'var(--system-red)' : 'black' }}>
                ₱{totalSpent.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--system-gray)' }}>Budget Limit</div>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>₱{budget.toLocaleString()}</div>
            </div>
          </div>
          {totalSpent > budget && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255, 59, 48, 0.1)', borderRadius: '10px', color: 'var(--system-red)', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
              You have exceeded your budget by ₱{(totalSpent - budget).toLocaleString()}
            </div>
          )}
        </div>
      )}

      <div className="ios-card" style={{ marginTop: budget > 0 ? '20px' : '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--system-gray)' }}>ITEM ANALYSIS (COST)</h4>
        </div>
        
        <div className="ios-segmented-control" style={{ marginBottom: '16px', display: 'flex' }}>
          <button 
            className={`ios-segmented-control-item ${activeChart === 'estimated' ? 'active' : ''}`}
            onClick={() => setActiveChart('estimated')}
            style={{ flex: 1, padding: '6px 12px', fontSize: '12px' }}
          >
            Estimated
          </button>
          <button 
            className={`ios-segmented-control-item ${activeChart === 'actual' ? 'active' : ''}`}
            onClick={() => setActiveChart('actual')}
            style={{ flex: 1, padding: '6px 12px', fontSize: '12px' }}
          >
            Actual
          </button>
          <button 
            className={`ios-segmented-control-item ${activeChart === 'variance' ? 'active' : ''}`}
            onClick={() => setActiveChart('variance')}
            style={{ flex: 1, padding: '6px 12px', fontSize: '12px' }}
          >
            Variance
          </button>
        </div>

        {comparisonData.length > 0 ? (
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'estimated' && (
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--system-gray-5)" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value}`} />
                  <Tooltip 
                    formatter={(value) => `₱${value.toLocaleString()}`}
                    cursor={{ fill: 'var(--system-gray-6)', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="estTotal" fill="var(--system-blue)" radius={[4, 4, 0, 0]} name="Estimated Cost" barSize={30} />
                </BarChart>
              )}
              {activeChart === 'actual' && (
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--system-gray-5)" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value}`} />
                  <Tooltip 
                    formatter={(value) => `₱${value.toLocaleString()}`}
                    cursor={{ fill: 'var(--system-gray-6)', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="actTotal" fill="var(--system-green)" radius={[4, 4, 0, 0]} name="Actual Cost" barSize={30} />
                </BarChart>
              )}
              {activeChart === 'variance' && (
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--system-gray-5)" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value}`} />
                  <Tooltip 
                    formatter={(value) => `₱${value.toLocaleString()}`}
                    cursor={{ fill: 'var(--system-gray-6)', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="costVariance" radius={[4, 4, 0, 0]} name="Cost Variance" barSize={30}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.costVariance < 0 ? 'var(--system-red)' : (entry.costVariance > 0 ? 'var(--system-green)' : 'var(--system-gray)')} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--system-gray)', fontSize: '14px' }}>
            Add items in the "Estimate" tab to see comparison analytics.
          </div>
        )}
      </div>

      {/* ESTIMATE TABLE */}
      <div className="ios-card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <h4 style={{ margin: '16px', fontSize: '15px', color: 'var(--system-gray)' }}>ESTIMATED DATA</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
            <thead>
              <tr style={{ background: 'var(--system-gray-6)', color: 'var(--system-gray)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500' }}>Item</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Qty</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {estimateData.map((est, idx) => (
                <tr key={idx} style={{ borderTop: '1px solid var(--system-gray-5)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{est.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{est.quantity} <span style={{ fontSize: '11px', color: 'var(--system-gray)' }}>{est.unit}</span></td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>₱{parseFloat(est.price || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>₱{(parseFloat(est.quantity || 0) * parseFloat(est.price || 0)).toLocaleString()}</td>
                </tr>
              ))}
              {estimateData.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--system-gray)' }}>No estimated data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTUAL TABLE */}
      <div className="ios-card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <h4 style={{ margin: '16px', fontSize: '15px', color: 'var(--system-gray)' }}>ACTUAL DATA</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
            <thead>
              <tr style={{ background: 'var(--system-gray-6)', color: 'var(--system-gray)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500' }}>Item</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Qty</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Avg Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {groupedActuals.map((act, idx) => (
                <tr key={idx} style={{ borderTop: '1px solid var(--system-gray-5)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{act.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{act.quantity} <span style={{ fontSize: '11px', color: 'var(--system-gray)' }}>{act.unit}</span></td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>₱{act.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>₱{act.totalCost.toLocaleString()}</td>
                </tr>
              ))}
              {groupedActuals.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--system-gray)' }}>No actual data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="ios-card" style={{ marginTop: '20px', padding: 0, overflow: 'hidden' }}>
        <h4 style={{ margin: '16px', fontSize: '15px', color: 'var(--system-gray)' }}>VARIANCE COMPARISON</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--system-gray-6)', color: 'var(--system-gray)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500' }}>Item</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Est Qty</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Act Qty</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Qty Var</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Est Cost</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Act Cost</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>Cost Var</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((comp, idx) => (
                <tr key={idx} style={{ borderTop: '1px solid var(--system-gray-5)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{comp.name}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{comp.estQty} <span style={{ fontSize: '10px', color: 'var(--system-gray)' }}>{comp.unit}</span></td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{comp.actQty} <span style={{ fontSize: '10px', color: 'var(--system-gray)' }}>{comp.unit}</span></td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: comp.qtyVariance < 0 ? 'var(--system-red)' : (comp.qtyVariance > 0 ? 'var(--system-green)' : 'inherit') }}>
                    {comp.qtyVariance > 0 ? '+' : ''}{comp.qtyVariance}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>₱{comp.estTotal.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>₱{comp.actTotal.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: comp.costVariance < 0 ? 'var(--system-red)' : (comp.costVariance > 0 ? 'var(--system-green)' : 'inherit') }}>
                    {comp.costVariance > 0 ? '+' : ''}₱{comp.costVariance.toLocaleString()}
                  </td>
                </tr>
              ))}
              {comparisonData.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--system-gray)' }}>No comparison data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ios-card" style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--system-gray)' }}>SPENDING TREND (₱)</h4>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--system-gray-5)" />
              <XAxis dataKey="date" hide />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value}`} />
              <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="amount" stroke="var(--system-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--system-blue)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
