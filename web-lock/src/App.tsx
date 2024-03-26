
import './App.css'
import React, { useState } from 'react';
import Popup from './Popup';

const App: React.FC = () => {
    const [blockedWebsites,setBlockedWebsites]=useState([]) 

     // Retrieve blocked websites from storage (if any)
        chrome.storage.sync.get("blockedWebsites", function (data) {
            if (data.blockedWebsites) {
              setBlockedWebsites(data.blockedWebsites);
            }
        });
   
   
    return (
        <div>
            <Popup />

            <ol>
{blockedWebsites.map((site)=><li>{site}</li>)}
            </ol>
           
        </div>
    );
};

export default App;