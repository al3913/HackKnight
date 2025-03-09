'use client';
 
 import React, { useState, useEffect } from 'react';
 import Image from 'next/image';
 import { useRouter } from 'next/navigation';
 import '../login.css';
 
 const ProfilePage = () => {
   const router = useRouter();
   const [isEditing, setIsEditing] = useState(false);
   const [userProfile, setUserProfile] = useState({
     name: 'John Captial',
     email: 'john.captial@example.com',
     id: '25030024',
     firstName: 'John',
     lastName: 'Captial'
   });
   const [editForm, setEditForm] = useState({
     firstName: '',
     lastName: '',
     email: ''
   });
 
   useEffect(() => {
     const savedProfile = localStorage.getItem('userProfile');
     if (savedProfile) {
       const profile = JSON.parse(savedProfile);
       setUserProfile(profile);
       // Split the name into first and last name for the edit form
       const [firstName = '', lastName = ''] = profile.name.split(' ');
       setEditForm({
         firstName,
         lastName,
         email: profile.email
       });
     }
   }, []);
 
   const handleSaveProfile = () => {
     const updatedProfile = {
       ...userProfile,
       name: `${editForm.firstName} ${editForm.lastName}`.trim(),
       email: editForm.email
     };
     
     localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
     setUserProfile(updatedProfile);
     setIsEditing(false);
   };
 
   const handleInputChange = (e) => {
     const { name, value } = e.target;
     setEditForm(prev => ({
       ...prev,
       [name]: value
     }));
   };
 
   const isFormValid = () => {
     return editForm.firstName.trim() && editForm.lastName.trim() && editForm.email.trim();
   };
 
   return (
     <div className="profile-page">
       <header className="profile-header">
         <button 
           className="back-button"
           onClick={() => router.push('/home')}
         >
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M19 12H5"/>
             <polyline points="12 19 5 12 12 5"/>
           </svg>
         </button>
         <h1>Profile</h1>
       </header>
 
       <div className="profile-content">
         <div className="profile-image-section">
           <div className="large-profile-image-container">
             <Image
               src="/dragon2.png"
               alt="Profile"
               width={150}
               height={150}
               className="profile-image"
             />
           </div>
           <button className="change-photo-button">Change Photo</button>
         </div>
 
         {isEditing ? (
           <div className="profile-edit-form">
             <div className="form-group">
               <label>First Name</label>
               <input
                 type="text"
                 name="firstName"
                 value={editForm.firstName}
                 onChange={handleInputChange}
                 className="profile-input"
                 placeholder="Enter your first name"
               />
             </div>
             <div className="form-group">
               <label>Last Name</label>
               <input
                 type="text"
                 name="lastName"
                 value={editForm.lastName}
                 onChange={handleInputChange}
                 className="profile-input"
                 placeholder="Enter your last name"
               />
             </div>
             <div className="form-group">
               <label>Email</label>
               <input
                 type="email"
                 name="email"
                 value={editForm.email}
                 onChange={handleInputChange}
                 className="profile-input"
                 placeholder="Enter your email"
               />
             </div>
             <div className="form-group">
               <label>ID</label>
               <input
                 type="text"
                 value={userProfile.id}
                 className="profile-input"
                 disabled
                 style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', cursor: 'not-allowed' }}
               />
             </div>
             <div className="profile-buttons">
               <button 
                 className={`save-button ${isFormValid() ? 'valid' : ''}`}
                 onClick={handleSaveProfile}
                 disabled={!isFormValid()}
               >
                 Save Changes
               </button>
               <button 
                 className="cancel-button"
                 onClick={() => setIsEditing(false)}
               >
                 Cancel
               </button>
             </div>
           </div>
         ) : (
           <div className="profile-info">
             <div className="info-group">
               <label>Name</label>
               <p>{userProfile.name}</p>
             </div>
             <div className="info-group">
               <label>Email</label>
               <p>{userProfile.email}</p>
             </div>
             <div className="info-group">
               <label>ID</label>
               <p>{userProfile.id}</p>
             </div>
             <button 
               className="edit-button"
               onClick={() => setIsEditing(true)}
             >
               Edit Profile
             </button>
           </div>
         )}
       </div>
     </div>
   );
 };
 
 export default ProfilePage; 