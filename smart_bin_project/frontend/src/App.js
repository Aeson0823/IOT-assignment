import React, { useState, useEffect } from "react";
import axios from "axios";
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Configure API Base URL
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="main-content">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "bins" && <BinList />}
        {currentView === "alerts" && <AlertList />}
        {currentView === "settings" && <div className="header">Settings (Coming Soon)</div>}
      </div>
    </div>
  );
}

// --- SIDEBAR COMPONENT ---
const Sidebar = ({ currentView, setCurrentView }) => (
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
  </div>
);

// --- DASHBOARD COMPONENT ---
const Dashboard = () => {
  const [stats, setStats] = useState({ total_bins: 0, active_alerts: 0, chart_data: [] });

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  // Chart Configuration
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
      <div className="card chart-container">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

// --- BIN LIST COMPONENT ---
const BinList = () => {
  const [bins, setBins] = useState([]);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newBin, setNewBin] = useState({ bin_identifier: "", location: "" });

  useEffect(() => {
    fetchBins();
  }, [search]); 

  const fetchBins = () => {
    const url = search ? `/bins?search=${search}` : "/bins";
    api.get(url)
      .then((res) => setBins(res.data))
      .catch((err) => console.error(err));
  };

  const handleAddBin = (e) => {
    e.preventDefault(); // Prevent page refresh
    api.post("/bins/add", newBin)
      .then((res) => {
        alert("Bin Added Successfully!");
        setShowModal(false);
        setNewBin({ bin_identifier: "", location: "" }); // Reset form
        fetchBins(); // Refresh list immediately
      })
      .catch((err) => {
        alert("Error: " + (err.response?.data?.message || "Failed to add bin"));
      });
  };

  return (
    <div className="fade-in">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1 className="header" style={{marginBottom: 0}}>All Smart Bins</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Bin</button>
      </div>

      <input 
        type="text" 
        placeholder="Search location or ID..." 
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
              <th>Battery</th>
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
                <td>{bin.status}</td>
                <td>{bin.battery_level}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL POPUP */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Bin</h2>
            <form onSubmit={handleAddBin}>
              <div className="form-group">
                <label>Bin Identifier (e.g., BIN-004)</label>
                <input 
                  type="text" 
                  required 
                  value={newBin.bin_identifier}
                  onChange={(e) => setNewBin({...newBin, bin_identifier: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  required 
                  value={newBin.location}
                  onChange={(e) => setNewBin({...newBin, location: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit">Save Bin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ALERT LIST COMPONENT ---
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
              <tr><td colSpan="4">No active alerts. Good job!</td></tr>
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