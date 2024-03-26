import React, { useEffect, useState } from 'react';

const Popup: React.FC = () => {
    const [website, setWebsite] = useState<string>('');
    const [isBlockingEnabled,setIsBlockingEnabled]=useState<boolean>(false) 
    const [timeLeft,setTimeLeft]=useState<number>(0) 
    const [timestamp,setTimestamp]=useState<number>(0) 

       useEffect(()=>{
            // Load the toggle state from storage
            chrome.storage.sync.get(['isBlockingEnabled','blockingTimestamp'], function(data) {
                if (data.isBlockingEnabled !== undefined) {
                    setIsBlockingEnabled(data.isBlockingEnabled);
                    setTimestamp(data.blockingTimestamp)
                }
            });
       },[])
     

       useEffect(()=>{
        if(isBlockingEnabled&&timestamp){
        const currentTime = Date.now();
        const left = timestamp + (1 * 60 * 1000) - currentTime
        if(left>0){
            setTimeLeft(left)
        }else{
            setTimeLeft(0)
        }}
       },[timeLeft])

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
        }else{
            chrome.runtime.sendMessage({ action: 'stopTimer'}, function(response) {
                console.log(response);
            });
        }
        

    }

    return (
        <div>
            <label htmlFor="toggleBlocking">Toggle Blocking:</label>
    <input type="checkbox" disabled={isBlockingEnabled} id="toggleBlocking" checked={isBlockingEnabled} onChange={toggleBlockingState}></input>
            <div>{timeLeft}</div>
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