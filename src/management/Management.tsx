import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/apiCall';
import './Management.css';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import generateToastContainer from '../var/ToastContainer';
import LaserCell from './LaserCell';

export interface Laser {
  name: string;
  id: string;
  status: string;
}

function Mangement() {
  const navigate = useNavigate();
  const [laserMap, setLaserMap] = useState<Map<string, Laser>>(new Map());
  const readersRef = useRef<ReadableStreamDefaultReader<Uint8Array>[]>([]);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  function addLaserById(uuid: string) {
    setLaserMap(prev => {
      const newMap = new Map(prev);
      if (uuid && prev.has(uuid)){
        const laser = newMap.get(uuid)!; // non-null assertion, since it exists
        newMap.set(uuid, { ...laser, status: 'active' });
      }
      else{
        newMap.set(uuid, { id: uuid, name: `Laser ${uuid}`, status: 'active' });
      }
      return newMap;
    });
  }

  function addLasersByIds(uuids: string[]) {
    setLaserMap(prev => {
      const newMap = new Map(prev);
      uuids.forEach(uuid => {
        if (!newMap.has(uuid)) {
          newMap.set(uuid, { id: uuid, name: `Laser ${uuid}`, status: 'loading' });
        }
      });
      return newMap;
    });
  }

  function setAllToFail() {
    setLaserMap(prev => {
      const newMap = new Map(prev);
      newMap.forEach((laser, id) => {
        if (laser.status === "loading") {
          newMap.set(id, { ...laser, status: "fail" });
        }
      });
      return newMap;
    });
  }

  function cleanAll(){
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
    readersRef.current.forEach(reader => {
      if(reader) {
        reader.cancel();
      }
    });
    readersRef.current = [];
  }

  useEffect(() => {
    return () => {
      cleanAll();
    };
  }, []);

  useEffect(() => {
    async function fetchSSE() {
      try{
        const response = await apiCall('user/lasers', 'GET', null);

        if (response!.status !== 200) {
          toast.error("Failed to fetch data from the server. Please try again later.");
          return;
        }

        else if (!response || typeof response !== 'object' || !response.ok || !response.body) {
          toast.error("Failed to connect to the server. Please try again later.");
          return;
        }
        
        const reader = response.body.getReader();
        readersRef.current.push(reader);
        const decoder = new TextDecoder(); 

        const timeOutId = setTimeout(() => {
          if (reader) {
            reader.cancel();
          }
          setAllToFail();
          toast.info("Connection to the server timed out. Some lasers may not have been loaded.");
        }, 30000);
        timeoutIdsRef.current?.push(timeOutId);

        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            try {
              const data = JSON.parse(chunk);
              if (data?.lasers && Array.isArray(data?.lasers)) {
                addLasersByIds(data.lasers);
              } else if(data?.uuid){
                addLaserById(data.uuid);
              }
            } catch (error) {
              console.error("Error parsing JSON:", error);
              toast.error("Error parsing server response.");
            }
          }
        }
      }
      catch (error) {
        toast.error("Failed to fetch data from the server. Please try again later.");
        setAllToFail();
        timeoutIdsRef.current.forEach(clearTimeout);
        timeoutIdsRef.current = [];
      }
    }
    fetchSSE();
  }, []);

  const handleGoToBleetooth = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/bluetooth');
  }

  const handleGoToGame = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/setup-game');
  }

  return (
    <div>
      <div className='buttons-management'>
         <button className = "ble-btn" onClick={handleGoToBleetooth}>Connect a new device</button>
         <button className = "game-btn" onClick={handleGoToGame}>Start a new game</button>
      </div>
      <h1>Management</h1>
      { laserMap.size > 0 ? (
        <div className="laser-list">
          {Array.from(laserMap.values()).map((laser) => (
            <LaserCell key={laser.id} name={laser.name} id={laser.id} status={laser.status}/>
          ))}
        </div>
      ) : (
        <p>No lasers available.</p>
      )}
      {generateToastContainer()}
    </div>
  );
}

export default Mangement;