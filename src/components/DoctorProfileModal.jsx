import React from 'react';
import './DoctorProfileModal.css';

const DoctorProfileModal = ({ doctor, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Dr. {doctor.name}</h2>
        <p><strong>Specialty:</strong> {doctor.specialty}</p>
        <p><strong>Open Slots:</strong> {2 - doctor.assignedPatients.length}</p>
        <p><strong>Patients Assigned:</strong></p>
        <ul>
          {doctor.assignedPatients.map((patientId) => (
            <li key={patientId}>Patient ID: {patientId}</li>
          ))}
        </ul>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default DoctorProfileModal;
