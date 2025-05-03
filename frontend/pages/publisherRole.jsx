import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { userContext } from '../context/userContext';

function PublisherRole() {
  const { applyPublisherRole } = useContext(userContext);

  const [formData, setFormData] = useState({
    requestedRole: 'publisher',
    bio: '',
    portfolio: '',
    contact: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { requestedRole, bio, portfolio, contact } = formData;
    await applyPublisherRole(requestedRole, bio, portfolio, contact);
  };

  return (
    <StyledWrapper>
      <div className="form-container">
        <h2 className="form-title">Become a City Insight Publisher</h2>
        <p className="form-subtitle">
          Submit your details below to apply for publisher privileges and share your stories with the community.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself, your experience or passion for news..."
              required
              rows="4"
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
              placeholder="Link to your articles or personal site"
              
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
              placeholder="Email or phone"
              required
            />
          </div>

          <button type="submit" className="form-submit-btn">
            Submit Application
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
  }

  .form-submit-btn:hover {
    background-color: #1e40af;
  }
`;

export default PublisherRole;
