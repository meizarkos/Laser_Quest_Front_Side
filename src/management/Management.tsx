import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/apiCall';
import './Management.css';
import { useEffect, useState } from 'react';

function Mangement() {
  
  const navigate = useNavigate();
  const [listOfEsp, setlistOfEsp] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAllUuid() {
      const response = await apiCall('user/lasers', 'GET', undefined);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched ESP UUIDs:", data);
        setlistOfEsp(data);
      } else {
        console.error("Failed to fetch ESP UUIDs");
      }
    }

    fetchAllUuid();
  }, []);

  const handleGoToBleetooth = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/bluetooth');
  }

  return (
    <div>
      <div>
         <button className = "ble-btn"onClick={handleGoToBleetooth}>Connect a new device</button>
      </div>
      <h1>Management</h1>
      <p>This is the management page.</p>
    </div>
  );
}

export default Mangement;