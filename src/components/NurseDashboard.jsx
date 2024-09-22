import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './NurseDashboard.css';

const NurseDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [nurseInfo] = useState({
    name: "Nurse Sarah Johnson",
    specialty: "General Medicine",
  });

  // Load patient and doctor data
  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/load-data');
      const fetchedPatients = response.data.patients || [];
      const fetchedDoctors = response.data.doctors || [];

      // Auto-assign patients on fetch
      autoAssignPatients(fetchedPatients, fetchedDoctors);

      setPatients(fetchedPatients);
      setDoctors(fetchedDoctors);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Auto-assign logic based on severity and doctor availability
  const autoAssignPatients = (patientsList, doctorsList) => {
    patientsList.forEach(patient => {
      // If patient is unassigned, auto-assign if a doctor is available
      if (!patient.assignedDoctor) {
        const availableDoctor = doctorsList.find(doctor => doctor.assignedPatients.length < 2);
        if (availableDoctor) {
          handleAssignPatient(patient.id, availableDoctor.id);
        }
      }
    });
  };

  // Assign a patient to a doctor
  const handleAssignPatient = async (patientId, doctorId) => {
    if (!doctorId) {
      console.error('No doctor selected.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/assign-patient', { patientId, doctorId });
      if (response.status === 200) {
        fetchData();  // Reload data after assigning
      } else {
        console.error('Error assigning patient:', response.data.error);
      }
    } catch (error) {
      console.error('Error assigning patient:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="nurse-dashboard-container">
      {/* Nurse Info */}
      <div className="top-bar">
        <div className="nurse-info">
          <img src="src/components/nurse.png" alt="Nurse" className="nurse-photo" />
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
                  <td>{patient.assignedDoctor ? `Dr. ${doctors.find(d => d.id === patient.assignedDoctor)?.name}` : 'Unassigned'}</td>
                  <td>
                    {!patient.assignedDoctor ? (
                      <select
                        onChange={(e) => {setSelectedDoctor(e.target.value); console.log(e.target.value)}} // Set the selected doctor
                        value={selectedDoctor || ""}
                        className="doctor-select"
                      >
                        <option value="" disabled>Select a Doctor</option>
                        {doctors
                          .filter(doctor => doctor.assignedPatients.length < 2)
                          .map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              Dr. {doctor.name} - {doctor.specialty}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <button
                        className="reassign-btn"
                        onClick={() => handleAssignPatient(patient.id, selectedDoctor)} // Assign the selected doctor
                      >
                        Assign Doctor
                      </button>
                    )}
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
              .filter(doctor => doctor?.assignedPatients?.length < 2)
              .map((doctor) => (
                <li key={doctor.id}>
                  <button className="doctor-select-btn">
                    {doctor.name} - {doctor.specialty} ({doctor.assignedPatients?.length || 0}/2)
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
