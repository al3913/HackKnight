import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import './login.css';

const LoginPage = () => {
  const router = useRouter();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
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
    // Here you would typically handle the account creation
    // For now, we'll just close the dialog
    setShowSignupDialog(false);
    // You could also automatically log them in and redirect
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
