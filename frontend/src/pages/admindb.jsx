import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './admindb.css';
import { apiUrl } from '../config/api';
import ResolutionForm from '../components/resolutionForm';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? '-' : parsedDate.toLocaleDateString();
};

function AdminDB() {
  useAuth();
  const [contacts, setContacts] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [pendingResolutions, setPendingResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchContacts();
    fetchResolutions();
    fetchPendingResolutions();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(apiUrl('/api/contacts'));
      const data = await response.json();
      if (response.ok) {
        setContacts(data);
      } else {
        setError(data.error || 'Failed to fetch contacts');
      }
    } catch (fetchError) {
      setError('Error connecting to server');
      console.error('Error:', fetchError);
    }
  };

  const fetchResolutions = async () => {
    try {
      const response = await fetch(apiUrl('/api/resolutions'));
      const data = await response.json();
      if (response.ok) {
        setResolutions(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch resolutions:', data.error || 'Unknown error');
      }
    } catch (fetchError) {
      console.error('Error fetching resolutions:', fetchError);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingResolutions = async () => {
    try {
      const response = await fetch(apiUrl('/api/pending-resolutions'));
      const data = await response.json();
      if (response.ok) {
        setPendingResolutions(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch pending resolutions:', data.error || 'Unknown error');
      }
    } catch (fetchError) {
      console.error('Error fetching pending resolutions:', fetchError);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/contacts/${id}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        setContacts(contacts.filter((contact) => contact.id !== id));
      } else {
        alert('Failed to delete contact message');
      }
    } catch (fetchError) {
      console.error('Error:', fetchError);
      alert('Error connecting to server');
    }
  };

  const deleteResolution = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resolution?')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/resolutions/${id}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        setResolutions(resolutions.filter((resolution) => resolution.id !== id));
      } else {
        alert('Failed to delete resolution');
      }
    } catch (fetchError) {
      console.error('Error:', fetchError);
      alert('Error connecting to server');
    }
  };

  const acceptResolution = async (id) => {
    if (!window.confirm('Are you sure you want to accept this resolution?')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/pending-resolutions/${id}/accept`), {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Resolution accepted and added to resolutions!');
        setPendingResolutions(pendingResolutions.filter((resolution) => resolution.id !== id));
        fetchResolutions();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to accept resolution');
      }
    } catch (fetchError) {
      console.error('Error:', fetchError);
      alert('Error connecting to server');
    }
  };

  const rejectResolution = async (id) => {
    if (!window.confirm('Are you sure you want to reject this resolution?')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/pending-resolutions/${id}/reject`), {
        method: 'POST',
      });

      if (response.ok) {
        alert('Resolution rejected and removed from pending list.');
        setPendingResolutions(pendingResolutions.filter((resolution) => resolution.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject resolution');
      }
    } catch (fetchError) {
      console.error('Error:', fetchError);
      alert('Error connecting to server');
    }
  };

  const renderResolutionLink = (resolution) => {
    if (!resolution.pdfLink) {
      return null;
    }

    return (
      <a
        href={resolution.pdfLink}
        className="view-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        View PDF
      </a>
    );
  };

  return (
    <div className="admindb-container">
      <div className="admindb-header">
        <h1>Admin Dashboard</h1>
      </div>
      <div className="admindb-content">
        <ResolutionForm onSuccess={fetchResolutions} />

        <div className="resolutions-table-container">
          <h2 className="resolutions-title">Resolutions & Rules</h2>
          {resolutions.length > 0 ? (
            <div className="table-wrapper">
              <table className="resolutions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Date Docketed</th>
                    <th>Date Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resolutions.map((resolution) => (
                    <tr key={resolution.id}>
                      <td>{resolution.id}</td>
                      <td className="title-cell">{resolution.title}</td>
                      <td>{formatDate(resolution.dateDocketed)}</td>
                      <td>{formatDate(resolution.datePublished)}</td>
                      <td>
                        <div className="action-buttons">
                          {renderResolutionLink(resolution)}
                          <button className="delete-button" onClick={() => deleteResolution(resolution.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-results">No resolutions found.</p>
          )}
        </div>

        <div className="pending-resolutions-container">
          <h2 className="pending-resolutions-title">Pending Resolutions</h2>
          {pendingResolutions.length > 0 ? (
            <div className="table-wrapper">
              <table className="pending-resolutions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Date Docketed</th>
                    <th>Date Published</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingResolutions.map((resolution) => (
                    <tr key={resolution.id}>
                      <td>{resolution.id}</td>
                      <td className="title-cell">{resolution.title}</td>
                      <td>{formatDate(resolution.dateDocketed)}</td>
                      <td>{formatDate(resolution.datePublished)}</td>
                      <td>{formatDate(resolution.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          {renderResolutionLink(resolution)}
                          <button className="accept-button" onClick={() => acceptResolution(resolution.id)}>
                            Accept
                          </button>
                          <button className="reject-button" onClick={() => rejectResolution(resolution.id)}>
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-results">No pending resolutions.</p>
          )}
        </div>

        <div className="contact-messages-section">
          <h2>Contact Messages</h2>

          {loading ? (
            <p>Loading contacts...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : contacts.length === 0 ? (
            <p>No contact messages yet.</p>
          ) : (
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.id}</td>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>
                      <button className="view-message-button" onClick={() => setSelectedMessage(contact)}>
                        View Message
                      </button>
                    </td>
                    <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="delete-button" onClick={() => deleteContact(contact.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedMessage && (
          <div className="message-modal-overlay" onClick={() => setSelectedMessage(null)}>
            <div className="message-modal-content" onClick={(event) => event.stopPropagation()}>
              <div className="message-modal-header">
                <h3>Message Details</h3>
                <button className="message-modal-close" onClick={() => setSelectedMessage(null)}>
                  &times;
                </button>
              </div>
              <div className="message-modal-body">
                <p><strong>Name:</strong> {selectedMessage.name}</p>
                <p><strong>Email:</strong> {selectedMessage.email}</p>
                <p><strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleDateString()}</p>
                <div className="message-modal-message">
                  <strong>Message:</strong>
                  <p>{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDB;
