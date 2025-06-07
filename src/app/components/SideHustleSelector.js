'use client';

import { useState } from 'react';
import SideHustleAdvisor from './SideHustleAdvisor';
import styles from './ChatBot.module.css';

const SideHustleSelector = () => {
    const [selectedHustle, setSelectedHustle] = useState('');

    const hustles = ["Uber", "Etsy", "Pokemon", "Ebay"];

    return (
        <div className={styles.chatContainer}>
            <div className={styles.header}>
                <h1>Side Hustle Advisor</h1>
            </div>
            
            <div className={styles.messagesContainer}>
                <div className={styles.messageWrapper}>
                    <div className={`${styles.message} ${styles.botMessage}`}>
                        Select a side hustle to get personalized advice about the best times to work and general tips:
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    padding: '20px',
                    justifyContent: 'center'
                }}>
                    {hustles.map(hustle => (
                        <button
                            key={hustle}
                            onClick={() => setSelectedHustle(hustle)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '20px',
                                border: 'none',
                                background: selectedHustle === hustle ? '#4CAF50' : '#f5f5f5',
                                color: selectedHustle === hustle ? 'white' : '#333',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontSize: '0.9rem'
                            }}
                        >
                            {hustle}
                        </button>
                    ))}
                </div>

                {selectedHustle && <SideHustleAdvisor selectedHustle={selectedHustle} />}
            </div>
        </div>
    );
};

export default SideHustleSelector; 