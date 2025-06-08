import { useState } from 'react';
import './Bluetooth.css';
import { IWifi } from './wifi.interface';
import WifiForm from './WifiForm';
import { connectToDevice } from './connectToBluetooth';

function Bluetooth() {
  const [wifi, setWifi] = useState<IWifi>();
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const onLoggedIn = async (error?: Error, wifi?: IWifi) =>{
    setWifi(wifi);
    if (characteristic && wifi) {
      const dataToSend = JSON.stringify(wifi); // Convert the object to JSON
      const encoder = new TextEncoder();
      const encoded = encoder.encode(dataToSend);

      try {
        await characteristic.writeValue(encoded);
        console.log('Data sent to ESP32:', dataToSend);
      } catch (err) {
        console.error('Failed to send data:', err);
      }
    } else {
      console.warn("Characteristic not connected yet");
    }
  }

    const handleConnect = async () => {
      const char = await connectToDevice();
      if (char) {
        setCharacteristic(char);
      }
    };

  
  return (
    <div className="App">
      <p>Send data over bluethooth</p>
      <br/>
      <br/>
      <button onClick={handleConnect}>Connect to ESP32</button>
      <br/>
      <br/>
      <WifiForm
        ssid="wi fi name"
        password="wi fi password"
        onLoggedIn={onLoggedIn}
      />
      <p>
        {wifi?.ssid}<br/>
        {wifi?.password}
      </p>
      <button>
        <a href="/">Go to Home</a>
      </button>
    </div>
  );
}

export default Bluetooth;
