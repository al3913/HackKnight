import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import './login.css';

const LoginPage = () => {
  const router = useRouter();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = () => {
    router.push('/home');
  };

  const handleSignupSubmit = () => {
    // Store user data in localStorage
    localStorage.setItem('userProfile', JSON.stringify({
      name: `${signupForm.firstName} ${signupForm.lastName}`,
      email: `${signupForm.username}@example.com`, // You might want to add email field instead
      id: '25030024' // You might want to generate this
    }));
    
    setShowSignupDialog(false);
    router.push('/home');
  };

  const isFormValid = () => {
    return (
      signupForm.firstName.length >= 2 &&
      signupForm.lastName.length >= 2 &&
      signupForm.username.length >= 3 &&
      signupForm.password.length >= 6 &&
      signupForm.password === signupForm.confirmPassword
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-container">
      <Image
        src="/cloud1.png"
        alt="Cloud"
        width={80}
        height={48}
        className="cloud"
      />
      <Image
        src="/cloud1.png"
        alt="Cloud"
        width={80}
        height={48}
        className="cloud"
      />
      <Image
        src="/cloud1.png"
        alt="Cloud"
        width={80}
        height={48}
        className="cloud"
      />
      <Image
        src="/cloud1.png"
        alt="Cloud"
        width={80}
        height={48}
        className="cloud"
      />
      
      <div className="tree"></div>
      <div className="tree"></div>
      <div className="tree"></div>
      <div className="tree"></div>

      <div className="logo-section">
        <Image
          src="/SIDEQUESTLOGO.png"
          alt="SideQuest Logo"
          width={400}
          height={200}
          className="logo"
        />
        <h1 className="title">Ready to begin your adventure?</h1>
      </div>

      <div className="button-container">
        <button className="login-button" onClick={handleLogin}>Login</button>
        <button className="signup-button" onClick={() => setShowSignupDialog(true)}>Signup</button>
      </div>

      {/* Signup Dialog */}
      {showSignupDialog && (
        <div className="signup-dialog-overlay">
          <div className="signup-dialog">
            <h2>Create Account</h2>
            <div className="signup-form">
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={signupForm.firstName}
                  onChange={handleInputChange}
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={signupForm.lastName}
                  onChange={handleInputChange}
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Create Username"
                  value={signupForm.username}
                  onChange={handleInputChange}
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  value={signupForm.password}
                  onChange={handleInputChange}
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={signupForm.confirmPassword}
                  onChange={handleInputChange}
                  className="signup-input"
                />
              </div>
              <div className="signup-dialog-buttons">
                <button 
                  className={`signup-dialog-button create ${isFormValid() ? 'valid' : ''}`}
                  onClick={handleSignupSubmit}
                  disabled={!isFormValid()}
                >
                  Create
                </button>
                <button 
                  className="signup-dialog-button cancel"
                  onClick={() => setShowSignupDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="wave-background"></div>

      <Image
        src="/dragon2.png"
        alt="Dragon"
        width={160}
        height={160}
        className="dragon"
      />
    </div>
  );
};

export default LoginPage;
