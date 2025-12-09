import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login"; // Ensure Login.js exists in the same folder
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./App.css";

// --- CHART CONFIGURATION ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- API SETUP ---
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

// --- MAIN APP COMPONENT ---
function App() {
  // 1. Initialize Token from Local Storage
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [currentView, setCurrentView] = useState("dashboard");

  // 2. Setup Axios Header Interceptor
  // This ensures the token is attached to every request automatically
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('auth_token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  // 3. Login Handler
  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setCurrentView("dashboard"); // Reset view on login
  };

  // 4. Logout Handler
  const handleLogout = () => {
    // Optional: Call backend to revoke token
    api.post('/logout').finally(() => {
      setToken(null);
      localStorage.removeItem('auth_token');
    });
  };

  // 5. Condition: If no token, show Login Screen
  if (!token) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // 6. Render Main App
  return (
    <div className="app-container">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={handleLogout} 
      />
      <div className="main-content">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "bins" && <BinList />}
        {currentView === "alerts" && <AlertList />}
        {currentView === "settings" && <div className="header">Settings</div>}
      </div>
    </div>
  );
}

// --- COMPONENT: SIDEBAR ---
const Sidebar = ({ currentView, setCurrentView, onLogout }) => (
  <div className="sidebar">
    <div className="logo">Smart Bin</div>
    <div className="menu">
      <button 
        className={currentView === "dashboard" ? "active" : ""} 
        onClick={() => setCurrentView("dashboard")}>
        Dashboard
      </button>
      <button 
        className={currentView === "bins" ? "active" : ""} 
        onClick={() => setCurrentView("bins")}>
        Bins
      </button>
      <button 
        className={currentView === "alerts" ? "active" : ""} 
        onClick={() => setCurrentView("alerts")}>
        Alerts
      </button>
      <button 
        className={currentView === "settings" ? "active" : ""} 
        onClick={() => setCurrentView("settings")}>
        Settings
      </button>
    </div>
    
    {/* Logout Button at the bottom */}
    <div style={{marginTop: 'auto'}}>
        <button 
            onClick={onLogout} 
            style={{
                color: '#f64e60', 
                textAlign: 'left', 
                background: 'none', 
                border: 'none', 
                padding: '15px', 
                cursor: 'pointer', 
                width: '100%',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
            <span>➜</span> Logout
        </button>
    </div>
  </div>
);

// --- COMPONENT: DASHBOARD ---
const Dashboard = () => {
  const [stats, setStats] = useState({ total_bins: 0, active_alerts: 0, chart_data: [] });

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  const chartData = {
    labels: ["12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "Now"],
    datasets: [
      {
        label: "Avg Fill Level (%)",
        data: stats.chart_data,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Fill Level Trends (Last 7 Hours)" },
    },
  };

  return (
    <div className="fade-in">
      <h1 className="header">Dashboard</h1>
      <div className="card-row">
        <div className="card">
          <h3>Total Bins</h3>
          <div className="big-number">{stats.total_bins}</div>
        </div>
        <div className="card">
          <h3>Active Alerts</h3>
          <div className="big-number red-text">{stats.active_alerts}</div>
        </div>
      </div>
      <div className="card chart-container" style={{height: '400px'}}>
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

// --- COMPONENT: BIN LIST ---
const BinList = () => {
  const [bins, setBins] = useState([]);
  const [search, setSearch] = useState("");  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({ bin_identifier: "", location: "", status: "Active" });

  useEffect(() => {
    fetchBins();
    const interval = setInterval(fetchBins, 3000);
    return () => clearInterval(interval);
  }, [search]); 

  const fetchBins = () => {
    if (!search && !editingId) { 
        api.get("/bins").then((res) => setBins(res.data)).catch(console.error);
    } else if (search) {
        api.get(`/bins?search=${search}`).then((res) => setBins(res.data)).catch(console.error);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ bin_identifier: "", location: "", status: "Active" });
    setShowModal(true);
  };

  const openEditModal = (bin) => {
    setEditingId(bin.bin_id);
    setFormData({ 
        bin_identifier: bin.bin_identifier, 
        location: bin.location, 
        status: bin.status 
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
        api.put(`/bins/${editingId}`, formData)
          .then(() => {
            alert("Bin Updated Successfully!");
            setShowModal(false);
            setEditingId(null);
            fetchBins(); 
          })
          .catch((err) => alert("Error: " + (err.response?.data?.message || "Failed")));
    } else {
        api.post("/bins/add", formData)
          .then(() => {
            alert("Bin Added Successfully!");
            setShowModal(false);
            fetchBins();
          })
          .catch((err) => alert("Error: " + (err.response?.data?.message || "Failed")));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this bin?")) {
        api.delete(`/bins/${id}`)
           .then(() => {
               alert("Bin Deleted.");
               fetchBins();
           })
           .catch((err) => alert("Failed to delete."));
    }
  };

  return (
    <div className="fade-in">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1 className="header" style={{marginBottom: 0}}>Bin Management</h1>
        <button className="btn-primary" onClick={openAddModal}>+ Add Bin</button>
      </div>

      <input 
        type="text" 
        placeholder="Search..." 
        className="search-bar"
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Bin ID</th>
              <th>Location</th>
              <th>Fill Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bins.map((bin) => (
              <tr key={bin.bin_id}>
                <td className="bold">{bin.bin_identifier}</td>
                <td>{bin.location}</td>
                <td>
                  <span className={`badge ${bin.fill_level > 80 ? 'critical' : 'normal'}`}>
                    {bin.fill_level}%
                  </span>
                </td>
                <td>
                    {/* Status Color Coding */}
                    <span style={{
                        color: bin.status === 'Active' ? 'green' : (bin.status === 'Offline' ? 'red' : 'orange'),
                        fontWeight: 'bold'
                    }}>
                        {bin.status}
                    </span>
                </td>
                <td>
                    <button onClick={() => openEditModal(bin)} style={{marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'}} title="Edit">✏️</button>
                    <button onClick={() => handleDelete(bin.bin_id)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'}} title="Delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL POPUP */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginTop: 0}}>{editingId ? "Edit Bin" : "Add New Bin"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Bin Identifier</label>
                <input 
                  type="text" 
                  required 
                  value={formData.bin_identifier}
                  onChange={(e) => setFormData({...formData, bin_identifier: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  required 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              
              {/* STATUS DROPDOWN (Only show when Editing) */}
              {editingId && (
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd'}}
                    >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Offline">Offline</option>
                    </select>
                  </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit">
                    {editingId ? "Update Bin" : "Save Bin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: ALERT LIST ---
const AlertList = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get("/alerts")
      .then((res) => setAlerts(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="fade-in">
      <h1 className="header">System Alerts</h1>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Alert Type</th>
              <th>Bin Identifier</th>
              <th>Message</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr><td colSpan="4" style={{textAlign: 'center', color: '#888'}}>No active alerts. System Healthy!</td></tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.alert_id}>
                  <td className="red-text bold">{alert.alert_type}</td>
                  <td>{alert.bin ? alert.bin.bin_identifier : "Unknown"}</td>
                  <td>{alert.message}</td>
                  <td>{new Date(alert.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;