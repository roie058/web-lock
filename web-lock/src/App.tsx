
import './App.css'
import React, { useState } from 'react';

import Timer from './components/Timer';
import Nav from './components/UI/Nav';
import ListPage from './components/ListPage';
import About from './components/About';

const App: React.FC = () => {
    const [page, setPage] = useState<"home" | "list" | "about">("home")
     
   
  const curPage = (page)=>{ switch (page) {
        case 'home':
           return <Timer  />
            break;
        case 'about':
         return  <About/>
            break;
        case "list":
           return <ListPage/>
        default:
            break;
    } }   
   
    return (
        <main className='main'>
            <Nav page={page} setPage={setPage}  />
            {curPage(page)}
           
        </main>
    );
};

export default App;