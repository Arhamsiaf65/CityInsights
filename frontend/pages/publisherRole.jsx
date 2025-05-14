import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { userContext } from '../context/userContext';

function PublisherRole() {
  const { applyPublisherRole, uploading, submitting } = useContext(userContext);

  const [formData, setFormData] = useState({
    requestedRole: 'publisher',
    bio: '',
    portfolio: '',
    contact: '',
    cnicFront: null,
    cnicBack: null,
    facePhoto: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await applyPublisherRole(formData);
  };

  return (
    <StyledWrapper>
      <div className="form-container">
        <h2 className="form-title">Become a City Insight Publisher</h2>
        <p className="form-subtitle">
          Submit your details below to apply for publisher privileges and share your stories with the community.
        </p>

        {(uploading || submitting) && (
          <div className="status-message">
            {uploading && <p>Uploading your documents, please wait...</p>}
            {submitting && <p>Submitting your application, please wait...</p>}
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              required
              rows="4"
              disabled={uploading || submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="portfolio">Portfolio URL</label>
            <input
              type="url"
              id="portfolio"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="Link to your articles or site"
              disabled={uploading || submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Info</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone or email"
              required
              disabled={uploading || submitting}
            />
          </div>

          <div className="form-group">
            <label>CNIC Front Photo</label>
            <input
              type="file"
              name="cnicFront"
              accept="image/*"
              onChange={handleChange}
              required
              disabled={uploading || submitting}
            />
          </div>

          <div className="form-group">
            <label>CNIC Back Photo</label>
            <input
              type="file"
              name="cnicBack"
              accept="image/*"
              onChange={handleChange}
              required
              disabled={uploading || submitting}
            />
          </div>

          <div className="form-group">
            <label>Face Photo (Selfie)</label>
            <input
              type="file"
              name="facePhoto"
              accept="image/*"
              onChange={handleChange}
              required
              disabled={uploading || submitting}
            />
          </div>

          <button
            type="submit"
            className="form-submit-btn"
            disabled={uploading || submitting}
          >
            {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #f3f4f6;
  padding: 3rem 1rem;

  .form-container {
    max-width: 640px;
    background-color: #ffffff;
    padding: 2.5rem 2rem;
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    border-left: 6px solid #1e3a8a;
  }

  .form-title {
    font-size: 28px;
    font-weight: 700;
    color: #1e3a8a;
    margin-bottom: 0.5rem;
  }

  .form-subtitle {
    font-size: 16px;
    color: #4b5563;
    margin-bottom: 1.5rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    font-weight: 600;
    font-size: 14px;
    color: #374151;
    margin-bottom: 0.4rem;
  }

  .form-group input,
  .form-group textarea {
    padding: 12px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    background-color: #f9fafb;
    transition: border 0.2s, box-shadow 0.2s;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  .form-submit-btn {
    align-self: flex-start;
    padding: 10px 24px;
    background-color: #2563eb;
    color: white;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    transition: background-color 0.3s ease;
    cursor: pointer;
  }

  .form-submit-btn:hover {
    background-color: #1e40af;
  }

  .form-submit-btn:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }

  .status-message {
    margin-bottom: 1rem;
    color: #1e3a8a;
    font-weight: 500;
  }
`;

export default PublisherRole;
