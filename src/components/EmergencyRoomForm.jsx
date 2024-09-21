import React, { useState } from 'react';
import axios from 'axios';

const EmergencyRoomForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    symptoms: '',
    painLevel: '',
    additionalInfo: ''
  });

  const [submitted, setSubmitted] = useState(false); // To track submission status
  const [error, setError] = useState(null); // To handle errors

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload or redirect
    setSubmitted(true); // Set form as submitted
    setError(null); // Reset error state

    // Submit data to the backend
    axios.post(import.meta.env.VITE_FLASK_END_POINT + '/patient-data', formData)
      .then(response => {
        console.log("Data submitted successfully:", response.data);
      })
      .catch(error => {
        console.error("Error submitting data:", error);
        setError("There was an issue submitting your information. Please try again."); // Set error state
      });
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Emergency Room Triage</h2>
          <p>Please fill out this form to help us assess your condition</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              name="age"
              type="number"
              placeholder="30"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="symptoms">Main Symptoms</label>
            <textarea
              id="symptoms"
              name="symptoms"
              placeholder="Describe your main symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="painLevel">Pain Level (1-10)</label>
            <input
              id="painLevel"
              name="painLevel"
              type="number"
              min="1"
              max="10"
              placeholder="5"
              value={formData.painLevel}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="additionalInfo">Additional Information</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Any other relevant information"
              value={formData.additionalInfo}
              onChange={handleChange}
            ></textarea>
          </div>
          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>

      {submitted && !error && (
        <div className="alert">
          <h3>Form Submitted</h3>
          <p>Your information has been recorded. A medical professional will assess your condition shortly.</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <h3>Submission Failed</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default EmergencyRoomForm;
