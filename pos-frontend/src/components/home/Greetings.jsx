import React, { useEffect, useState } from 'react';

const Greetings = () => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) =>
        date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

    const formatDate = (date) =>
        date.toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });

    const getGreeting = (date) => {
        const hour = date.getHours();

        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className='flex justify-between items-center px-8 mt-5 w-full'>
            <div>
                <h1 className='text-[#f5f5f5] text-2xl font-semibold tracking-wide'>
                    {getGreeting(dateTime)}, Antonio
                </h1>
                <p className='text-[#ababab] text-sm'>
                    Give your best services for customers 😄
                </p>
            </div>

            <div className='text-right'>
                <h1 className='text-[#f5f5f5] text-xl font-medium'>
                    {formatTime(dateTime)}
                </h1>
                <p className='text-[#ababab] text-sm'>
                    {formatDate(dateTime)}
                </p>
            </div>
        </div>
    );
};

export default Greetings;
