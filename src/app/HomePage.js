import React from 'react';
import Image from 'next/image';
import './login.css';

const HomePage = () => {
  return (
    <div className="home-container">
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

      <div className="content-section">
        <h1 className="welcome-title">Welcome to SideQuest</h1>
        <div className="quest-container">
          <div className="quest-card">
            <h2>Active Quests</h2>
            <div className="quest-list">
              <div className="quest-item">
                <h3>Dragon's Lair Challenge</h3>
                <p>Defeat the dragon and claim your reward!</p>
              </div>
              <div className="quest-item">
                <h3>Forest Explorer</h3>
                <p>Discover hidden treasures in the mystical forest.</p>
              </div>
            </div>
          </div>
          <div className="quest-card">
            <h2>Completed Quests</h2>
            <div className="quest-list">
              <div className="quest-item completed">
                <h3>Tutorial Quest</h3>
                <p>Learn the basics of adventuring</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default HomePage; 