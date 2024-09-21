import React, { useState } from 'react';
import './EmergencyRoomForm.css';
import axios from 'axios';
import ChatModal from './ChatModal'; // Ensure to import your ChatModal component

const EmergencyRoomForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    symptoms: '',
    painLevel: '',
    additionalInfo: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState("");
  const [isChatOpen, setChatOpen] = useState(false); // State to manage chat modal visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(JSON.stringify(formData, null, 2));
    setSubmitted(true);
    axios.post(import.meta.env.VITE_FLASK_END_POINT + '/patient-data', formData)
      .then(response => {
        // Handle successful response (optional)
        console.log("Data submitted successfully:", response.data);
        setSummary(response.data['Summary'][1]);
        console.log("Summary: " + {summary});
      })
      .catch(error => {
        // Handle error response
        console.error("Error submitting data:", error);
      });
  };

  const openChat = () => {
    setChatOpen(true); // Function to open the chat modal
  };

  const closeChat = () => {
    setChatOpen(false); // Function to close the chat modal
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
              placeholder="Full Name"
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
              placeholder="Age"
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
            <label htmlFor="painLevel">Pain Level (1-5)</label>
            <input
              id="painLevel"
              name="painLevel"
              type="number"
              min="1"
              max="5"
              placeholder="..."
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
      {submitted && (
        <>
          <div className="alert">
            <h3>Form Submitted</h3>
            <p>Your information has been recorded. A medical professional will assess your condition shortly.</p>
            <br/>
          </div>

          <div className="alert-summary">
            <h3>Patient Summary:</h3>
            <p>{summary}</p>
          </div>

          <div className="alert">
            <h3>Dr. Jay will reach out to you shortly. ETA: 6 mins</h3>
            <button onClick={openChat}>Consult with a virtual assistant</button>
          </div>

          {/* Render the Chat Modal */}
          <ChatModal isOpen={isChatOpen} onClose={closeChat} patientSummary={summary}/>
        </>
      )}
    </div>
  );
};

export default EmergencyRoomForm;