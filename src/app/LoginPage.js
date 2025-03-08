import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import './login.css';

const LoginPage = () => {
  const router = useRouter();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showQuestionnaireDialog, setShowQuestionnaireDialog] = useState(false);
  const [sideHustles, setSideHustles] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [signupForm, setSignupForm] = useState({
    firstName: 'John',
    lastName: 'Capital',
    username: 'JohnCap101',
    password: 'password123',
    confirmPassword: 'password123'
  });

  const handleLogin = () => {
    router.push('/home');
  };

  const handleSignupSubmit = () => {
    // Store user data in localStorage
    localStorage.setItem('userProfile', JSON.stringify({
      name: `${signupForm.firstName} ${signupForm.lastName}`,
      email: `${signupForm.username}@example.com`,
      id: '25030024'
    }));
    
    setShowSignupDialog(false);
    setShowBankDialog(true); // Show bank connection dialog instead of redirecting
  };

  const handleBankConnect = () => {
    setShowBankDialog(false);
    setShowQuestionnaireDialog(true);
  };

  const handleAddSideHustle = () => {
    if (currentInput.trim()) {
      setSideHustles([...sideHustles, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const handleRemoveSideHustle = (index) => {
    setSideHustles(sideHustles.filter((_, i) => i !== index));
  };

  const handleFinishQuestionnaire = () => {
    // Store side hustles in localStorage
    localStorage.setItem('userSideHustles', JSON.stringify(sideHustles));
    setShowQuestionnaireDialog(false);
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

      {/* Bank Connection Dialog */}
      {showBankDialog && (
        <div className="signup-dialog-overlay">
          <div className="signup-dialog">
            <h2>Connect Your Bank Account</h2>
            <div className="bank-connect-content">
              <p className="bank-description">
                The app uses secure banking APIs to connect your account
              </p>
              <p className="bank-security">
                Your data is protected
              </p>
              <p className="bank-disclaimer">
                The app won't have access to your credentials or be able to perform any action from your account.
              </p>
              <button 
                className="signup-dialog-button create valid"
                onClick={handleBankConnect}
              >
                Continue
              </button>
              <p className="privacy-notice">
                By continuing you are accepting our <a href="#" className="privacy-link">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Questionnaire Dialog */}
      {showQuestionnaireDialog && (
        <div className="signup-dialog-overlay">
          <div className="signup-dialog">
            <h2>Tell Us About Your Side Hustles</h2>
            <div className="questionnaire-content">
              <p className="questionnaire-description">
                What side hustles are you interested in or currently doing?
              </p>
              
              <div className="input-container">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Enter a side hustle"
                  className="side-hustle-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSideHustle();
                    }
                  }}
                />
                <button 
                  className="add-button"
                  onClick={handleAddSideHustle}
                >
                  Add
                </button>
              </div>

              <div className="side-hustles-list">
                {sideHustles.map((hustle, index) => (
                  <div key={index} className="side-hustle-item">
                    <span>{hustle}</span>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveSideHustle(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button 
                className="signup-dialog-button create valid"
                onClick={handleFinishQuestionnaire}
                disabled={sideHustles.length === 0}
              >
                Continue
              </button>
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
      <style jsx>{`
        .bank-connect-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
        }
        .bank-description {
          color: #093030;
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        .bank-security {
          color: #227C72;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .bank-disclaimer {
          color: #666;
          font-size: 0.85rem;
          margin-bottom: 2rem;
          line-height: 1.4;
        }
        .privacy-notice {
          color: #666;
          font-size: 0.8rem;
          margin-top: 1rem;
        }
        .privacy-link {
          color: #227C72;
          text-decoration: none;
        }
        .privacy-link:hover {
          text-decoration: underline;
        }
        .questionnaire-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
          width: 100%;
        }
        .questionnaire-description {
          color: #093030;
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }
        .input-container {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          margin-bottom: 1rem;
        }
        .side-hustle-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #E2E8F0;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          color: #093030;
        }
        .add-button {
          padding: 0.75rem 1.5rem;
          background-color: #227C72;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }
        .add-button:hover {
          background-color: #1b6359;
        }
        .side-hustles-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          width: 100%;
          margin-bottom: 2rem;
          min-height: 50px;
          max-height: 200px;
          overflow-y: auto;
          padding: 0.5rem;
        }
        .side-hustle-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #E8F7D6;
          border-radius: 2rem;
          font-size: 0.9rem;
          color: #093030;
        }
        .remove-button {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0 0.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .remove-button:hover {
          color: #093030;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
