import React, { useState, useEffect } from 'react';

const CountdownTimer: React.FC<{ deadline: string }> = ({ deadline }) => {
    const [timeLeft, setTimeLeft] = useState(new Date(deadline).getTime() - new Date().getTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(new Date(deadline).getTime() - new Date().getTime());
        }, 1000);
        return () => clearInterval(timer);
    }, [deadline]);
    
    if (timeLeft <= 0) {
        return <p className="text-lg text-center text-red-500 font-semibold">The deadline has passed. Awaiting automatic resolution...</p>;
    }
    
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const displayHours = String(hours).padStart(2, '0');
    const displayMinutes = String(minutes).padStart(2, '0');
    const displaySeconds = String(seconds).padStart(2, '0');

    return (
        <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Time left to submit: 
                <span className="font-mono text-2xl text-brand-primary ml-2 tracking-wider">{`${displayHours}:${displayMinutes}:${displaySeconds}`}</span>
            </p>
        </div>
    );
};

export default CountdownTimer;
