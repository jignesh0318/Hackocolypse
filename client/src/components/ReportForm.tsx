import { useState } from 'react';
import './ReportForm.css';

const ReportForm = () => {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Report submitted:', { reportType, description });
    // Add API call here
    setReportType('');
    setDescription('');
    alert('Report submitted successfully!');
  };

  return (
    <div className="report-form-container">
      <h3>📝 Report an Issue</h3>
      <form onSubmit={handleSubmit} className="report-form">
        <select
          aria-label="Issue Type"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          required
        >
          <option value="">Select Issue Type</option>
          <option value="harassment">😰 Harassment</option>
          <option value="no-light">💡 No Street Light</option>
          <option value="suspicious">👀 Suspicious Activity</option>
          <option value="drunk">🍺 Drunk Group</option>
          <option value="other">📋 Other</option>
        </select>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the incident..."
          rows={4}
          required
        />

        <button type="submit" className="btn-report">
          Submit Report
        </button>
      </form>
    </div>
  );
};

export default ReportForm;