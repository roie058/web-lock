import { useState } from 'react'



const ListPage = () => {
    const [blockedWebsites,setBlockedWebsites]=useState([]) 
    const [website, setWebsite] = useState<string>('');

       // Retrieve blocked websites from storage (if any)
           chrome.storage.sync.get("blockedWebsites", function (data) {
               if (data.blockedWebsites) {
                setBlockedWebsites(data.blockedWebsites);
              }
           });

        
        const handleAddWebsite = () => {
            if (website.trim() !== '') {
                blockedWebsites.push(website)
                 chrome.runtime.sendMessage({ action: 'addBlockedWebsite', website: website }, function(response) {
                     console.log(response);
                 });
                setWebsite('');
            }
        };
    
        const handleRemoveWebsite = (site) => {
            if (site.trim() !== '') {
                setBlockedWebsites(list=>list.filter((sites)=>(sites !== site)))
                 chrome.runtime.sendMessage({ action: 'removeBlockedWebsite', website: website }, function(response) {
                     console.log(response);
                 });
            }
        };

  return (
    <section>
    <ol>
         {blockedWebsites.map((site)=><li> <p>{site}</p><button onClick={()=>{handleRemoveWebsite(site)}}>Remove</button> </li>)} 
         
         
    </ol>
    <h2>Add to Blocked-List</h2>
    <div style={{display:"flex"}}>
    <input
            style={{padding:"0.6em 1.2em",borderRadius:"8px 0 0 8px",border:"1px solid gainsboro"}}
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Enter website URL"
            />
            <button style={{borderRadius:"0 8px 8px 0"}}  onClick={handleAddWebsite}>Add</button>
    </div>
           
            
    </section>

  )
}

export default ListPage