import { useState } from 'react';
import './WifiForm.css';
import { IWifi } from './wifi.interface';
import { toast, ToastContainer } from 'react-toastify';

export interface LoginFormProps {
  ssid?: string;
  password?: string;
  sendWifiCred?: (error?:Error,user?:IWifi) => void;
}

function WifiForm(props : LoginFormProps){

  const  [ssid, setSsid] = useState<string>(props.ssid || '');
  const  [password, setPassword] = useState<string>(props.password || '');

  const handleInputChange = (state : React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      state(e.target.value);
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(ssid === '' || password === ''){
      toast.error("Please fill in both fields.");
    }
    else{
      if(props.sendWifiCred){
        props.sendWifiCred(undefined, {
          ssid,
          password
        });
      }
      toast.info("Sending WiFi credentials to the laser, wait a moment...",{
        autoClose: false,
      });
    }
    
  }

  return (
    <div>
      <h2 className='title'>Give your laser access to the WiFi</h2>
      <form 
        onSubmit={handleSubmit}    
      >
        <div>
          
          <input type="text" name="SSID" placeholder="Wifi name" value={ssid}
            onChange={handleInputChange(setSsid)} //generate a function from a function (result = (e)=>setLogin(e.target.value))
          />
        </div>
        <div>
          
          <input type="text" name="password" placeholder="Wifi password"  value={password}
            onChange={handleInputChange(setPassword)} 
          />
        </div>
        <input type="submit" value="Send wifi access to your laser"/>
      </form>

    </div>
    
  )
}

export default WifiForm;