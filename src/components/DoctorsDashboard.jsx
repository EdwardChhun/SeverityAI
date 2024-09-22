import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DoctorsDashboard.css';

const DoctorsDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [seenPatients, setSeenPatients] = useState([]);

  // Function to fetch live patients and seen patients
  const fetchPatients = async () => {
    try {
      const livePatientsResponse = await axios.get('http://127.0.0.1:5000/patients');
      const seenPatientsResponse = await axios.get('http://127.0.0.1:5000/seen-patients');
      setPatients(livePatientsResponse.data.patients);
      setSeenPatients(seenPatientsResponse.data.seen_patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  // Function to mark patient as seen
  const handleMarkSeen = async (patientId) => {
    try {
      await axios.post(`http://127.0.0.1:5000/mark-seen/${patientId}`);
      // Re-fetch the data after marking the patient as seen
      fetchPatients();
    } catch (error) {
      console.error('Error marking patient as seen:', error);
    }
  };

  useEffect(() => {
    fetchPatients(); // Fetch patients when the component mounts
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Live Cases</h2>
      <table className="patients-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Symptoms</th>
            <th>Pain Level</th>
            <th>Severity</th>
            <th>Explanation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.age}</td>
              <td>{patient.symptoms}</td>
              <td>{patient.painLevel}</td>
              <td>{patient.severity}</td>
              <td>{patient.explanation}</td>
              <td>
                <button
                  onClick={() => handleMarkSeen(patient.id)}
                  className="accept-button"
                >
                  Accept
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Seen Patients</h2>
      <table className="patients-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Symptoms</th>
            <th>Pain Level</th>
            <th>Severity</th>
            <th>Explanation</th>
          </tr>
        </thead>
        <tbody>
          {seenPatients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.age}</td>
              <td>{patient.symptoms}</td>
              <td>{patient.painLevel}</td>
              <td>{patient.severity}</td>
              <td>{patient.explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorsDashboard;
