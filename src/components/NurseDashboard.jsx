import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './NurseDashboard.css';
import DoctorProfileModal from './DoctorProfileModal';

const NurseDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [nurseInfo] = useState({
    name: "Nurse Sarah Johnson",
    specialty: "General Medicine",
  });
  const [showDoctorProfile, setShowDoctorProfile] = useState(false); // For modal visibility

  // Load patient and doctor data
  const fetchData = async () => {
    try {
      console.log("Fetching data from backend...");
      const response = await axios.get('http://127.0.0.1:5000/load-data');
      console.log("Fetched data: ", response.data);
      setPatients(response.data.patients || []);
      setDoctors(response.data.doctors || []);
      setLoading(false);  // Set loading to false after data is fetched
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleDoctorClick = (doctorId) => {
    const doctor = doctors.find(doc => doc.id === doctorId);
    if (doctor) {
      console.log("Selected Doctor: ", doctor);
      setSelectedDoctor(doctor);
      setShowDoctorProfile(true);  // Show doctor profile modal
    } else {
      console.error(`Doctor with ID ${doctorId} not found!`);
    }
  };

  const handleAssignPatient = async (patientId, doctorId) => {
    if (!doctorId) {
      console.error('No doctor selected!');
      return;
    }

    try {
      console.log(`Assigning patient ${patientId} to doctor ${doctorId}`);
      const response = await axios.post('http://127.0.0.1:5000/assign-patient', { patientId, doctorId });
      if (response.status === 200) {
        console.log("Patient assigned successfully");
        fetchData(); // Reload data
      } else {
        console.error('Error assigning patient:', response.data.error);
      }
    } catch (error) {
      console.error('Error assigning patient:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, []);

  // Show a loading message or spinner
  if (loading) return <div>Loading...</div>;

  return (
    <div className="nurse-dashboard-container">
      {/* Nurse Info */}
      <div className="top-bar">
        <div className="nurse-info">
          <img src="./nurse.png" alt="Nurse" className="nurse-photo" />
          <div>
            <h2>{nurseInfo.name}</h2>
            <p>Specialty: {nurseInfo.specialty}</p>
          </div>
        </div>
        <button className="logout-button">Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Patients Section */}
        <div className="patients-section">
          <h3>Live Cases (Sorted by Priority)</h3>
          <table className="patients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Symptoms</th>
                <th>Pain Level</th>
                <th>Severity</th>
                <th>Explanation</th>
                <th>Assigned Doctor</th>
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
                    {patient.assignedDoctor ? (
                      <>
                        Dr. {doctors.find(d => d.id === patient.assignedDoctor)?.name || "Unknown"}
                      </>
                    ) : (
                      'Unassigned'
                    )}
                  </td>
                  <td>
                    {/* Allow reassignment regardless of whether a doctor is assigned */}
                    <button 
                      className="assign-btn" 
                      onClick={() => handleAssignPatient(patient.id, selectedDoctor?.id)}  // Ensure selectedDoctor has an id
                      disabled={!selectedDoctor}  // Disable if no doctor is selected
                    >
                      {patient.assignedDoctor ? 'Reassign Doctor' : 'Assign Doctor'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Available Doctors Section */}
        <div className="available-doctors-section">
          <h3>Available Doctors</h3>
          <ul className="doctors-list">
            {doctors
              .filter(doctor => doctor?.assignedPatients?.length < 2)  // Only show available doctors
              .map((doctor) => (
                <li key={doctor.id}>
                  <button 
                    className="doctor-select-btn" 
                    onClick={() => {
                      setSelectedDoctor(doctor);  // Correctly set the selected doctor here
                      handleDoctorClick(doctor.id);
                    }}
                  >
                    {doctor.name} - {doctor.specialty} ({doctor.assignedPatients?.length || 0}/2)
                  </button>
                </li>
              ))}
          </ul>
        </div>

        {/* Doctor Profile Modal */}
        {showDoctorProfile && selectedDoctor && (
          <DoctorProfileModal 
            doctor={selectedDoctor} 
            onClose={() => setShowDoctorProfile(false)}
          />
        )}
      </div>
    </div>
  );
};

export default NurseDashboard;
