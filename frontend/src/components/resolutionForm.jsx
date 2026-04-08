import React, { useState } from 'react';
import { apiUrl } from '../config/api';
import './resolutionForm.css';

const initialFormState = {
  title: '',
  dateDocketed: '',
  datePublished: '',
  pdfLink: '',
};

function ResolutionForm({ onSuccess, title = 'Add Resolution', description = 'Paste the OneDrive PDF file link and publish it directly to the approved resolutions list.', className = '' }) {
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePdfLink = (value) => {
    try {
      const parsedUrl = new URL(value);
      return parsedUrl.protocol === 'https:';
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const pdfLink = formData.pdfLink.trim();
    if (!pdfLink) {
      setError('PDF link is required.');
      return;
    }

    if (!validatePdfLink(pdfLink)) {
      setError('Please enter a valid OneDrive PDF link that starts with https://');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/resolutions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          pdfLink,
          dateDocketed: formData.dateDocketed,
          datePublished: formData.datePublished,
          status: 'approved',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Resolution added successfully.');
        setFormData(initialFormState);
        window.dispatchEvent(new CustomEvent('resolution-added'));
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        setError(data.error || data.message || 'Failed to add resolution');
      }
    } catch (error) {
      setError('Error connecting to server');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`resolution-form-card ${className}`.trim()} id="add-resolution">
      <div className="resolution-form-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form className="resolution-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-input"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateDocketed" className="form-label">
              Date Docketed *
            </label>
            <input
              type="date"
              id="dateDocketed"
              name="dateDocketed"
              className="form-input"
              value={formData.dateDocketed}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="datePublished" className="form-label">
              Date Published *
            </label>
            <input
              type="date"
              id="datePublished"
              name="datePublished"
              className="form-input"
              value={formData.datePublished}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pdfLink" className="form-label">
            OneDrive PDF Link *
          </label>
          <input
            type="text"
            id="pdfLink"
            name="pdfLink"
            className="form-input"
            placeholder="Paste OneDrive PDF link"
            value={formData.pdfLink}
            onChange={handleChange}
            required
          />
          <p className="form-help-text">
            Upload the PDF to OneDrive first, then paste the full shareable file link here.
          </p>
        </div>

        <button type="submit" className="add-button" disabled={loading}>
          {loading ? 'Saving...' : 'Add Resolution'}
        </button>
      </form>
    </div>
  );
}

export default ResolutionForm;
