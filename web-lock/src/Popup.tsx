import React, { useEffect, useState } from 'react';

const Popup: React.FC = () => {
    const [website, setWebsite] = useState<string>('');
    const [isBlockingEnabled,setIsBlockingEnabled]=useState<boolean>(false) 
    const [timeLeft,setTimeLeft]=useState<number>(0) 

       useEffect(()=>{
            // Load the toggle state from storage
            chrome.storage.sync.get(['isBlockingEnabled','blockingTimestamp'], function(data) {
                if (data.isBlockingEnabled !== undefined) {
                    setIsBlockingEnabled(data.isBlockingEnabled);
                    if (data.isBlockingEnabled) {
                        // Calculate the remaining time before turning off blocking
                        const blockingTimestamp = data.blockingTimestamp || 0;
                        const currentTime = Date.now();
                        const remainingTime = blockingTimestamp + (1 * 60 * 1000) - currentTime; // 2 minutes
                        
                        if (remainingTime > 0) {
                            setTimeLeft(remainingTime);
                            // Start the countdown timer
                            const timerId = setInterval(() => {
                                setTimeLeft(prevTimeLeft => {
                                    if (prevTimeLeft <= 1000) {
                                        clearInterval(timerId);
                                        setIsBlockingEnabled(false);
                                        return 0;
                                    }
                                    return prevTimeLeft - 1000;
                                });
                            }, 1000);
                        } else {
                            // If the time limit has already passed, turn off blocking
                            setIsBlockingEnabled(false);
                          
                        }
                    }
                }
            });
       },[])
     

    const handleAddWebsite = () => {
        if (website.trim() !== '') {
            chrome.runtime.sendMessage({ action: 'addBlockedWebsite', website: website }, function(response) {
                console.log(response);
            });
            setWebsite('');
        }
    };

    const handleRemoveWebsite = () => {
        if (website.trim() !== '') {
            chrome.runtime.sendMessage({ action: 'removeBlockedWebsite', website: website }, function(response) {
                console.log(response);
            });
            setWebsite('');
        }
    };

    function toggleBlockingState() {
        const newIsBlockingEnabled = !isBlockingEnabled;
        setIsBlockingEnabled(newIsBlockingEnabled);

        chrome.runtime.sendMessage({ action: 'toggleBlock', isBlock: newIsBlockingEnabled }, function(response) {
            console.log(response);
        });

        if (newIsBlockingEnabled) {
            chrome.runtime.sendMessage({ action: 'startTimer',countdown:1 }, function(response) {
                console.log(response);
            });
            setTimeLeft(1 * 60 * 1000); // Reset the timer
            const timerId = setInterval(() => {
                setTimeLeft(prevTimeLeft => {
                    console.log(prevTimeLeft,"and");
                    if (prevTimeLeft <= 1000) {
                        clearInterval(timerId);
                        setIsBlockingEnabled(false);
                        return 0;
                    }
                    return prevTimeLeft - 1000;
                });
            }, 1000);

        }else{
            chrome.runtime.sendMessage({ action: 'stopTimer'}, function(response) {
                console.log(response);
            });
            setTimeLeft(0); // Reset the timer
        }
    }

    // Format the remaining time as minutes and seconds
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const formattedTimeLeft = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;


    return (
        <div>
            <label htmlFor="toggleBlocking">Toggle Blocking:</label>
    <input type="checkbox" disabled={isBlockingEnabled} id="toggleBlocking" checked={isBlockingEnabled} onChange={toggleBlockingState}></input>
    {isBlockingEnabled && (
                <div>
                    Time Left: {formattedTimeLeft}
                </div>
            )}
            <h2>Add or Remove Blocked Websites</h2>
            <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Enter website URL"
            />
            <button onClick={handleAddWebsite}>Add</button>
            <button onClick={handleRemoveWebsite}>Remove</button>
            
        </div>
    );
};

export default Popup;