import { useState } from 'react';
import './WifiForm.css';
import { IWifi } from './wifi.interface';

export interface LoginFormProps {
  ssid?: string;
  password?: string;
  onLoggedIn?: (error?:Error,user?:IWifi) => void;
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
    if(props.onLoggedIn){
      props.onLoggedIn(undefined, {
        ssid,
        password
      });
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}    
    >
      <div>
        <label htmlFor="SSID">Email:</label>
        <input type="text" name="SSID" placeholder="SSID" value={ssid}
          onChange={handleInputChange(setSsid)} //generate a function from a function (result = (e)=>setLogin(e.target.value))
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input type="text" name="password" placeholder="password"  value={password}
          onChange={handleInputChange(setPassword)} 
        />
      </div>
      <input type="submit" value="Login"/>
    </form>
  )
}

export default WifiForm;