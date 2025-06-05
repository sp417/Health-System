import { useEffect, useState } from 'react';
import Auth from './Auth';
import './style.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState('dashboard');
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (isAuthenticated && page !== 'dashboard') fetchPatients();
  }, [page, isAuthenticated]);

  const fetchPatients = async () => {
    const res = await fetch('http://13.204.65.29:3008/patients');
    const data = await res.json();
    setPatients(data);
  };

  const updateDashboardCount = (status) =>
    patients.filter(p => p.status === status).length;

  const handlePageChange = (pageName) => {
    setPage(pageName);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const addPatient = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newPatient = {
      photo: photo || 'https://thumbs.dreamstime.com/b/man-mask-peek-up-blue-sign-man-white-mask-175427178.jpg',
      name: form.name.value,
      age: parseInt(form.age.value),
      height: parseInt(form.height.value),
      weight: parseInt(form.weight.value),
      bp: form.bp.value,
      oxygen: parseInt(form.oxygen.value),
      disease: form.disease.value,
      heartrate: parseInt(form.heartrate.value),
      status: form.status.value,
      prescription: ''
    };

    await fetch('http://13.204.65.29:3008/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient)
    });

    setPhoto(null);
    form.reset();
    fetchPatients();
    setPage('details');
  };

  const deletePatient = async (idx) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    const id = patients[idx]._id;
    await fetch(`http://13.204.65.29:3008/patients/${id}`, { method: 'DELETE' });
    fetchPatients();
  };

  const savePrescription = async () => {
    const text = document.getElementById('prescription-details').value;
    await fetch(`http://13.204.65.29:3008/patients/${currentPatientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prescription: text })
    });
    fetchPatients();
    alert('Prescription saved!');
  };

  const showPrescription = (id) => {
    setCurrentPatientId(id);
    const patient = patients.find(p => p._id === id);
    if (patient) {
      document.getElementById('prescription-details').value = patient.prescription;
      setPage('prescriptions');
    }
  };

  if (!isAuthenticated) {
  return <Auth onLogin={() => {
    setIsAuthenticated(true);
    setTimeout(() => fetchPatients(), 100); // ensures dashboard gets data right after login
  }} />;
  }

  return (
    <div>
      <div className="logout-container">
        <button className="logout-button" onClick={() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }}>Logout</button>
      </div>
      <div className="main-header">
        <h1>Health Monitoring System</h1>
        <div className="nav-bar">
          <button className={page === 'dashboard' ? 'active' : ''} onClick={() => handlePageChange('dashboard')}>Dashboard</button>
          <button className={page === 'details' ? 'active' : ''} onClick={() => handlePageChange('details')}>Patient Details</button>
          <button className={page === 'prescriptions' ? 'active' : ''} onClick={() => handlePageChange('prescriptions')}>Prescriptions</button>
        </div>
        <div className="photo-upload-section">
          <img id="main-photo-preview" className="photo-preview" src="https://as2.ftcdn.net/jpg/02/28/40/53/1000_F_228405383_GV2xDIzrX0feAH2KSqJXkTCEUlFgSMcY.jpg" alt="System Logo" />
          <label className="photo-upload-label">
            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
            Change System Photo
          </label>
        </div>
      </div>

      <div className="container">
        {page === 'dashboard' && (
          <div className="stats">
            <div className="stat critical-box">
              <h2>{updateDashboardCount('Critical')}</h2>
              <div>Critical Patients</div>
            </div>
            <div className="stat stable-box">
              <h2>{updateDashboardCount('Stable')}</h2>
              <div>Stable Patients</div>
            </div>
          </div>
        )}

        {page === 'details' && (
          <div>
            <h2 style={{ color: '#1976d2', marginBottom: '0.3rem' }}>Patient List</h2>
            <table id="patients-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Height</th>
                  <th>Weight</th>
                  <th>Blood Pressure</th>
                  <th>Oxygen Level</th>
                  <th>Disease</th>
                  <th>Heart Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                  <th>Prescription</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, idx) => (
                  <tr key={p._id}>
                    <td><img src={p.photo} className="patient-photo-thumb" alt="" /></td>
                    <td>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.height}</td>
                    <td>{p.weight}</td>
                    <td>{p.bp}</td>
                    <td>{p.oxygen}</td>
                    <td>{p.disease}</td>
                    <td>{p.heartrate}</td>
                    <td>{p.status}</td>
                    <td className="actions">
                      <button className="edit-btn">Edit</button>
                      <button onClick={() => deletePatient(idx)}>Delete</button>
                    </td>
                    <td><button onClick={() => window.open().document.write(`<pre><h2>Prescription for ${p.name}</h2><br>${p.prescription}</pre>`) }>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ color: '#43a047', marginTop: '2rem' }}>Add Patient</h3>
            <form id="add-patient-form" onSubmit={addPatient}>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              <input type="text" name="name" placeholder="Name" required />
              <input type="number" name="age" placeholder="Age" min="0" required />
              <input type="number" name="height" placeholder="Height (cm)" min="0" required />
              <input type="number" name="weight" placeholder="Weight (kg)" min="0" required />
              <input type="text" name="bp" placeholder="Blood Pressure" required />
              <input type="number" name="oxygen" placeholder="Oxygen Level (%)" min="0" max="100" required />
              <input type="text" name="disease" placeholder="Disease" required />
              <input type="number" name="heartrate" placeholder="Heart Rate" min="0" required />
              <select name="status" required>
                <option value="">Status</option>
                <option value="Critical">Critical</option>
                <option value="Stable">Stable</option>
              </select>
              <button type="submit">Add</button>
              <button type="button" id="prescriptions-btn" onClick={() => setPage('prescriptions')}>Prescriptions</button>
            </form>
          </div>
        )}

        {page === 'prescriptions' && (
          <div id="prescriptions-page">
            <h2>Patient Prescriptions</h2>
            <ul id="prescription-list">
              {patients.map(p => (
                <li key={p._id}>
                  {p.name} :
                  <button onClick={() => showPrescription(p._id)}>View Prescription</button>
                </li>
              ))}
            </ul>
            <div>
              <h3>Add/Edit Prescription</h3>
              <textarea id="prescription-details" placeholder="Enter prescription details" />
              <button onClick={savePrescription}>Save Prescription</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
