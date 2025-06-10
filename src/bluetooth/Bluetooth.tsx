import { useState } from 'react';
import './Bluetooth.css';
import { IWifi } from './wifi.interface';
import WifiForm from './WifiForm';
import { connectToDevice } from './connectToBluetooth';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


function Bluetooth() {
  const navigate = useNavigate();
  const [wifi, setWifi] = useState<IWifi>();
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | undefined>(undefined);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);


  const sendWifiCred = async (error?: Error, wifi?: IWifi) =>{
    setWifi(wifi);
    if (characteristic && wifi) {
      const dataToSend = JSON.stringify(wifi); // Convert the object to JSON
      const encoder = new TextEncoder();
      const encoded = encoder.encode(dataToSend);

      try {
        await characteristic.writeValue(encoded);
      } catch (err) {
        console.error('Failed to send data:', err);
      }
    } 
    else {
      console.warn("Characteristic not connected yet");
    }
  }

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (bluetoothDevice?.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
      setCharacteristic(undefined);
      setBluetoothDevice(undefined);
      console.log("Disconnected before navigating");
    }
    
    navigate('/');
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectToDevice();
      if (result?.characteristic) {
        setCharacteristic(result?.characteristic);
        setBluetoothDevice(result?.device);
        toast.success("Connected to Bluetooth device successfully!");
      }
      else if(characteristic && bluetoothDevice) {
        toast.info("No change to the current connection.");
      }
      else {
        toast.error("Bluetooth connection cancel.");
      }
    } catch (error) {
      console.log('Connection failed:');
      toast.error("Connection failed. Please try again.") 
    } finally {
      setIsConnecting(false);
    }
  };

  
  return (
    <div className="Bluetooth">
      <div>
         <button className = "back-btn"onClick={handleBackClick}>Go back home</button>
      </div>
  
      <p>Connect your laser via Bluetooth</p>
  
      <button className="connect-btn" onClick={handleConnect}>
        {characteristic ? 'Change bluetooth device' : 'Connect to ESP32'}
      </button>
    
      {isConnecting && <div className="loader" />}
      {
        characteristic && !isConnecting &&
        <WifiForm
          ssid=""
          password=""
          sendWifiCred={sendWifiCred}
        /> 
      }
      <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} pauseOnHover={false} pauseOnFocusLoss={false} closeOnClick />
    </div>
  );
}

export default Bluetooth;
