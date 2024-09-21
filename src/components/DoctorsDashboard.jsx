import React, { useState, useEffect } from 'react';
import './DoctorsDashboard.css';
import axios from 'axios';

const DoctorsDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [seenPatients, setSeenPatients] = useState([]);
  const [error, setError] = useState(false); // Tracks if there was an error fetching data
  const [loading, setLoading] = useState(true); // Tracks the loading state
  const [dataFetched, setDataFetched] = useState(false); // Tracks if data was successfully fetched

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
    fetchSeenPatients();
  }, []);

  // Fetch live patients
  const fetchPatients = async () => {
    try {
      setLoading(true); // Start loading
      setError(false); // Reset error state before making a new request
      const response = await axios.get(import.meta.env.VITE_FLASK_END_POINT + '/patients');
      setPatients(response.data.patients);
      setLoading(false); // Stop loading
      setDataFetched(true); // Indicate that the data was fetched
      if (!response.data.patients.length) {
        setError(false); // No records found but not an error
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(true); // Set error on fetch failure
      setLoading(false); // Stop loading
    }
  };

  // Fetch seen patients
  const fetchSeenPatients = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_FLASK_END_POINT + '/seen-patients');
      setSeenPatients(response.data.seen_patients);
    } catch (err) {
      console.error('Error fetching seen patients:', err);
      setError(true); // Set error on fetch failure
    }
  };

  // Prevent re-rendering unless button is clicked for retry
  const handleRetry = () => {
    setError(false); // Reset error
    fetchPatients(); // Retry fetching the patients
    fetchSeenPatients(); // Retry fetching seen patients
  };

  // Display loading state while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there was a fetch failure, show error message and "Try Again" button
  if (error) {
    return (
      <div>
        <div>System error, click to try again.</div>
        <button onClick={handleRetry} className="retry-button">Try Again</button>
      </div>
    );
  }

  // If no data has been fetched and there are no patients in the database
  if (dataFetched && patients.length === 0) {
    return <div>No patients yet</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Live Cases</h2>
      {/* Render the patients table if there are patients */}
      {patients.length > 0 ? (
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
            {patients.map(patient => (
              <tr key={patient._id}>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.symptoms}</td>
                <td>{patient.painLevel}</td>
                <td>{patient.severity}</td>
                <td>{patient.explanation}</td>
                <td>
                  <button className="accept-button" onClick={() => markAsSeen(patient._id)}>
                    Accept
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No patients yet</div> // Displayed if there are no patients
      )}

      <h2>Seen Patients</h2>
      {/* Only render table if there are seen patients */}
      {seenPatients.length > 0 ? (
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
            {seenPatients.map(patient => (
              <tr key={patient._id}>
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
      ) : (
        <div>No seen patients yet</div> // Displayed if there are no seen patients
      )}
    </div>
  );
};

export default DoctorsDashboard;