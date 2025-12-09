import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 

const Login = ({ onLogin }) => {
  const [step, setStep] = useState(1); // 1 = Login/Register, 2 = OTP
  const [isRegistering, setIsRegistering] = useState(false);

  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let url = 'http://127.0.0.1:8000/api/v1';
    let payload = {};

    // Logic to determine which API to call
    if (step === 2) {
        url += '/verify-otp';
        payload = { email, otp };
    } else if (isRegistering) {
        url += '/register';
        payload = { name, email, password };
    } else {
        url += '/login';
        payload = { email, password };
    }

    try {
      const res = await axios.post(url, payload);

      // Check if Server asks for OTP
      if (res.data.require_otp) {
          alert(res.data.message);
          setStep(2); // Move to OTP Screen
      } else {
          // Success! Log the user in
          onLogin(res.data.access_token);
      }

    } catch (err) {
      console.error(err.response);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Action failed';
      alert(msg);
    }
  };

  return (
    <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}>
      <div className="card" style={{maxWidth: '400px', width: '100%', padding: '40px'}}>
        
        <h2 className="header" style={{textAlign: 'center'}}>
          {step === 2 ? 'Verify Email' : (isRegistering ? 'Create Account' : 'Smart Bin Login')}
        </h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: Main Form */}
          {step === 1 && (
              <>
                {isRegistering && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                )}
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </>
          )}

          {/* STEP 2: OTP Box */}
          {step === 2 && (
              <div className="form-group">
                <label style={{textAlign: 'center', display: 'block'}}>Enter 6-Digit Code</label>
                <input 
                    type="text" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    maxLength="6"
                    placeholder="123456"
                    style={{textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold'}}
                    required 
                />
                <p style={{textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '10px'}}>
                    Sent to: <b>{email}</b>
                </p>
              </div>
          )}

          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '20px'}}>
            {step === 2 ? 'Verify Code' : (isRegistering ? 'Next' : 'Login')}
          </button>
        </form>

        {/* Toggle Login/Register (Only on Step 1) */}
        {step === 1 && (
            <p style={{textAlign: 'center', marginTop: '20px', color: '#888', cursor: 'pointer'}} 
               onClick={() => setIsRegistering(!isRegistering)}>
               {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </p>
        )}
        
        {/* Cancel OTP (Only on Step 2) */}
        {step === 2 && (
            <p style={{textAlign: 'center', marginTop: '20px', color: '#f64e60', cursor: 'pointer'}} 
               onClick={() => setStep(1)}>
               Cancel
            </p>
        )}

      </div>
    </div>
  );
};

export default Login;