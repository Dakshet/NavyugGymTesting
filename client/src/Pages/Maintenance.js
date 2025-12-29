import React, { useEffect, useState } from 'react';
import './Maintenance.css';

const Maintenance = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Set target date: January 1, 2026
        const targetDate = new Date('2026-01-01T00:00:00').getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        // Calculate immediately
        calculateTimeLeft();

        // Update every second
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    // Title change
    useEffect(() => {
        document.title = "Navyug Gym - Under Maintenance";
    }, []);

    return (
        <div className="maintenance-container">
            <div className="maintenance-content">
                <div className="maintenance-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                
                <h1 className="maintenance-title">We're Under Maintenance</h1>
                
                <p className="maintenance-message">
                    We're working hard to improve our website and bring you a better experience.
                    Please check back soon!
                </p>

                <div className="launch-date">
                    <p className="launch-label">Website will be live on:</p>
                    <p className="launch-date-text">January 1, 2026</p>
                </div>

                <div className="countdown-container">
                    <div className="countdown-item">
                        <div className="countdown-value">{timeLeft.days}</div>
                        <div className="countdown-label">Days</div>
                    </div>
                    <div className="countdown-separator">:</div>
                    <div className="countdown-item">
                        <div className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</div>
                        <div className="countdown-label">Hours</div>
                    </div>
                    <div className="countdown-separator">:</div>
                    <div className="countdown-item">
                        <div className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
                        <div className="countdown-label">Minutes</div>
                    </div>
                    <div className="countdown-separator">:</div>
                    <div className="countdown-item">
                        <div className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
                        <div className="countdown-label">Seconds</div>
                    </div>
                </div>

                <div className="gym-brand">
                    <p className="brand-name">Navyug Gym</p>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;

