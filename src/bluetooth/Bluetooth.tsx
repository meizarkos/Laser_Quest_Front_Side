import { useState,useEffect } from 'react';
import './Bluetooth.css';
import { IWifi } from './wifi.interface';
import WifiForm from './WifiForm';
import { connectToDevice } from './connectToBluetooth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import generateToastContainer from '../var/ToastContainer';

const SUCCESS = "Success";
const FAILURE = "Failure"; 


function Bluetooth() {
  const navigate = useNavigate();
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | undefined>(undefined);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wifiConnectionState, setWifiConnectionState] = useState<String | undefined>(undefined);

  useEffect(() => {
  return () => {
    // This function runs when the component is about to unmount
      if (bluetoothDevice?.gatt?.connected) {
        bluetoothDevice.gatt.disconnect();
        console.log("Disconnected from Bluetooth device on page leave");
      }
    };
  }, [bluetoothDevice]);


  const sendWifiCred = async (error?: Error, wifi?: IWifi) =>{
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

  const handleDisconnect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (bluetoothDevice?.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
      setCharacteristic(undefined);
      setBluetoothDevice(undefined);
      console.log("Disconnected before navigating");
    }
    
    navigate('/management');
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectToDevice();
      if (result?.characteristic) {
        setCharacteristic(result?.characteristic);
        setBluetoothDevice(result?.device);
        await result.characteristic.startNotifications();
        result.characteristic.addEventListener('characteristicvaluechanged', event => {
          const target = event.target as BluetoothRemoteGATTCharacteristic | null;
          const value = new TextDecoder().decode(target?.value?.buffer || new ArrayBuffer(0));
          if( value === SUCCESS){
            toast.success("Your laser is now connected to the WiFi!");
          }
          else{
            toast.error("Your laser failed to connect to the WiFi. Please check the credentials.");
          }
          setWifiConnectionState(value ?? FAILURE);
        });
        toast.success("Connected to Bluetooth device successfully!");
      }
      else if(characteristic && bluetoothDevice) {
        toast.info("No change to the current connection.");
      }
      else {
        toast.error("Bluetooth connection cancel.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Connection failed. Please try again.") 
    } finally {
      setIsConnecting(false);
    }
  };
  
  
  return (
    <div className="Bluetooth">
      <div>
         <button className = "back-btn"onClick={handleDisconnect}>Go back home</button>
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
      {wifiConnectionState === SUCCESS && (
        <p className="wifi-success">
          Your laser is now connected to the WiFi!
        </p>
      )}

      {wifiConnectionState === FAILURE && (
        <p className="wifi-failure">
          Your laser failed to connect to the WiFi. Please check the credentials.
        </p>
      )}
      {generateToastContainer()}
    </div>
  );
}

export default Bluetooth;
