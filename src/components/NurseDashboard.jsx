import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './NurseDashboard.css';
import DoctorProfileModal from './DoctorProfileModal';

const NurseDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [nurseInfo] = useState({
    name: "Nurse Sarah Johnson",
    specialty: "General Medicine",
  });
  const [searchDoctor, setSearchDoctor] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [showDoctorProfile, setShowDoctorProfile] = useState(false); // For modal visibility

  // Load patient and doctor data
  const fetchData = async () => {
    try {
      console.log("Fetching data from backend...");
      const response = await axios.get('http://127.0.0.1:5000/load-data');
      console.log("Fetched data: ", response.data);
      setPatients(response.data.patients || []);
      setDoctors(response.data.doctors || []);
      setFilteredDoctors(response.data.doctors || []);
      setFilteredPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDoctorClick = (doctorId) => {
    const doctor = doctors.find(doc => doc.id === doctorId);
    console.log("Selected Doctor: ", doctor);
    setSelectedDoctor(doctor);
    setShowDoctorProfile(true);
  };

  const handleAssignPatient = async (patientId, doctorId) => {
    if (!doctorId) {
      console.error('No doctor selected!');
      return;
    }
  
    try {
      console.log(`Assigning/Reassigning patient ${patientId} to doctor ${doctorId}`);
      const response = await axios.post('http://127.0.0.1:5000/assign-patient', { patientId, doctorId });
      if (response.status === 200) {
        console.log("Patient assigned/reassigned successfully");
        fetchData(); // Reload data
      } else {
        console.error('Error assigning/reassigning patient:', response.data.error);
      }
    } catch (error) {
      console.error('Error assigning/reassigning patient:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle search for doctors
  const handleSearchDoctor = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchDoctor(query);
    const filtered = doctors.filter(doc =>
      doc.name.toLowerCase().includes(query) || doc.specialty.toLowerCase().includes(query)
    );
    setFilteredDoctors(filtered);
  };

  // Handle search for patients
  const handleSearchPatient = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchPatient(query);
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(query) || patient.symptoms.toLowerCase().includes(query)
    );
    setFilteredPatients(filtered);
  };

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

          {/* Search Patients */}
          <input
            type="text"
            placeholder="Search patients by name or symptoms..."
            className="search-input"
            value={searchPatient}
            onChange={handleSearchPatient}
          />

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
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.symptoms}</td>
                  <td>{patient.painLevel}</td>
                  <td>{patient.severity}</td>
                  <td>{patient.explanation}</td>
                  <td>
                    {patient.assignedDoctor ? (
                      <button 
                        className="doctor-name-btn" 
                        onClick={() => handleDoctorClick(patient.assignedDoctor)}
                      >
                        Dr. {doctors.find(d => d.id === patient.assignedDoctor)?.name || "Unknown"}
                      </button>
                    ) : (
                      'Unassigned'
                    )}
                  </td>
                  <td>
                    <button 
                      className="assign-btn" 
                      onClick={() => handleAssignPatient(patient.id, selectedDoctor?.id)}
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

          {/* Search Doctors */}
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            className="search-input"
            value={searchDoctor}
            onChange={handleSearchDoctor}
          />

          <ul className="doctors-list">
            {filteredDoctors.map((doctor) => (
              <li key={doctor.id}>
                <button 
                  className={`doctor-select-btn ${doctor.assignedPatients?.length === 2 ? 'doctor-fully-booked' : ''}`}
                  onClick={() => {
                    if (doctor.assignedPatients?.length < 2) {
                      setSelectedDoctor(doctor);  
                      handleDoctorClick(doctor.id);
                    }
                  }}
                  disabled={doctor.assignedPatients?.length === 2} // Disable button if fully booked
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
