import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import './login.css';

const LoginPage = () => {
  const router = useRouter();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [signupForm, setSignupForm] = useState({
    firstName: 'John',
    lastName: 'Capital',
    username: 'JohnCap135',
    password: 'John12345678',
    confirmPassword: 'John12345678'
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const handleLogin = () => {
    router.push('/home');
  };

  const handleSignupClick = () => {
    setShowSignupDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Check if passwords match when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password') {
        setPasswordsMatch(value === signupForm.confirmPassword);
      } else {
        setPasswordsMatch(value === signupForm.password);
      }
    }
  };

  const handleCreateAccount = () => {
    if (signupForm.password !== signupForm.confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    // Close signup dialog and show bank connection dialog
    setShowSignupDialog(false);
    setShowBankDialog(true);
  };

  const handleBankConnect = () => {
    // Here you would typically handle the bank connection
    // For now, we'll just close the dialog and redirect
    setShowBankDialog(false);
    router.push('/home');
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
        <button className="signup-button" onClick={handleSignupClick}>Signup</button>
      </div>

      {showSignupDialog && (
        <div className="signup-dialog-overlay">
          <div className="signup-dialog">
            <h2>Create Account</h2>
            <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  value={signupForm.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  value={signupForm.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  value={signupForm.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={signupForm.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={signupForm.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="signup-input"
                />
                {!passwordsMatch && (
                  <span className="password-error">Passwords do not match</span>
                )}
              </div>
              <div className="signup-dialog-buttons">
                <button 
                  className={`signup-dialog-button create ${signupForm.password && passwordsMatch ? 'valid' : ''}`}
                  onClick={handleCreateAccount}
                  disabled={!signupForm.password || !passwordsMatch}
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
            </form>
          </div>
        </div>
      )}

      {showBankDialog && (
        <div className="signup-dialog-overlay">
          <div className="signup-dialog">
            <h2>Connect Your Bank Account</h2>
            <div className="bank-connection-content">
              <p style={{ color: '#093030', marginBottom: '1rem' }}>
                The app uses secure banking APIs to connect your account
              </p>
              <p style={{ color: '#227C72', fontWeight: 'bold', marginBottom: '1rem' }}>
                Your data is protected
              </p>
              <p style={{ color: '#093030', fontSize: '0.9rem', opacity: 0.8, marginBottom: '2rem' }}>
                The app won't have access to your credentials or be able to perform any action from your account.
              </p>
              <div className="signup-dialog-buttons">
                <button 
                  className="signup-dialog-button create valid"
                  onClick={handleBankConnect}
                >
                  Continue
                </button>
              </div>
              <p style={{ 
                color: '#093030', 
                fontSize: '0.8rem', 
                opacity: 0.7, 
                marginTop: '1rem',
                textAlign: 'center' 
              }}>
                By continuing you are accepting our <span style={{ color: '#227C72', cursor: 'pointer' }}>Privacy Policy</span>
              </p>
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
