import { useEffect, useState } from 'react'
import styles from "./UI/Timer.module.css"
import CircularSlider from '@fseehawer/react-circular-slider';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BlockIcon, OpenIcon } from './UI/Icons';






const Timer = () => {
    const [isBlockingEnabled,setIsBlockingEnabled]=useState<boolean>(false) 
    const [timeLeft,setTimeLeft]=useState<number>(0) 
    const [time,setTime]=useState<number>(0) 

    
         useEffect(()=>{
              // Load the toggle state from storage
              chrome.storage.sync.get(['isBlockingEnabled','blockingTimestamp','countdown'], function(data) {
                  if (data.isBlockingEnabled !== undefined) {
                      setIsBlockingEnabled(data.isBlockingEnabled);
                      if (data.isBlockingEnabled) {
                          // Calculate the remaining time before turning off blocking
                          const blockingTimestamp = data.blockingTimestamp || 0;
                          const currentTime = Date.now();
                          const remainingTime = blockingTimestamp + ( data.countdown) - currentTime; // 2 minutes
                        
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


    function toggleBlockingState(timer:number) {
        const newIsBlockingEnabled = !isBlockingEnabled;
        setIsBlockingEnabled(newIsBlockingEnabled);

          chrome.runtime.sendMessage({ action: 'toggleBlock', isBlock: newIsBlockingEnabled }, function(response) {
              console.log(response);
          });

         if (newIsBlockingEnabled) {
              chrome.runtime.sendMessage({ action: 'startTimer',countdown:timer }, function(response) {
                  console.log(response);
              });
             setTimeLeft(timer); // Reset the timer
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

         }else{
              chrome.runtime.sendMessage({ action: 'stopTimer'}, function(response) {
                  console.log(response);
              });
             setTimeLeft(0); // Reset the timer
        }
    }
    const formatTime = (timing:number)=>{
        // Format the remaining time as minutes and seconds
        const hours = Math.floor(timing / 3600000).toString().padStart(2,"0");
        const minutes = Math.floor((timing % 3600000)/60/1000).toString().padStart(2,"0");
        const seconds = Math.floor((timing % 60000) / 1000)
        return `${hours}:${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
  return (
    <>
    <form className={styles.formStyle}>
        <div className={styles.timeCircle} style={{ width: 250, position:"relative" }}>
            {isBlockingEnabled?<BlockIcon style={{position:"absolute",left:37.5, top:37.5}}/>:<OpenIcon style={{position:"absolute",left:34, top:37.5}}/>}
        {!isBlockingEnabled ? <CircularSlider
           labelColor="#005a58"
           knobColor="#6f86d6"
           width={250}
           
           progressColorFrom="#6f86d6"
           progressColorTo="#89f7fe"
           progressSize={10}
           trackColor="#eeeeee"
           trackSize={10}
           renderLabelValue={<h1>{formatTime(time)}</h1>}
           dataIndex={10}
           min={1}
           max={14400000}
           onChange={ value => { setTime(value); } }
        />: <><CircularProgressbar  styles={{
            // Customize the root svg element
            root: {},
            // Customize the path, i.e. the "completed progress"
            path: {
              // Path color

              stroke: `linear-gradient(90deg, #89f7fe 0%, #66a6ff 100%)`,
              // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
              strokeLinecap: 'round',
              // Customize transition animation
              transition: 'stroke-dashoffset 0.5s ease 0s',
              // Rotate the path
            },
            // Customize the circle behind the path, i.e. the "total progress"
            trail: {
              // Trail color
              stroke: "rgb(238, 238, 238)",
              // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
              strokeLinecap: 'butt',
              // Rotate the trail
              transform: 'rotate(0.25turn)',
              transformOrigin: 'center center',
            },
            // Customize background - only used when the `background` prop is true
            background: {
              fill: '#3e98c7',
            },
          }} strokeWidth={3.5}   value={timeLeft} minValue={1}  maxValue={14400000}  /><h1>{formatTime(timeLeft)}</h1></> }
        </div>

    <button disabled={isBlockingEnabled} type="submit" onClick={()=>{if(isBlockingEnabled){return};toggleBlockingState(time);
    }}>Start</button>
    </form>
    </>
  )
}

export default Timer