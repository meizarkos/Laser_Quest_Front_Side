import { useState } from 'react';
import './Bluetooth.css';
import { IWifi } from './wifi.interface';
import WifiForm from './WifiForm';

function Bluetooth() {
  const [wifi, setWifi] = useState<IWifi>();

  const onLoggedIn = (error?: Error, wifi?: IWifi) => {
    setWifi(wifi);
    console.log('onLoggedIn',wifi);
  }
  
  return (
    <div className="App">
      <p>Send data over bluethooth</p>
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
