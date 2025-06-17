import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConnectForm.css';
import { toast } from 'react-toastify';
import generateToastContainer from '../var/ToastContainer';
import { apiCall } from '../utils/apiCall';
import TokenStore from '../utils/tokenStore';

function ConnectForm(){
  const navigate = useNavigate();
  const  [email, setEmail] = useState<string>('aaa@aaa.com');
  const  [password, setPassword] = useState<string>('aaa');

  const handleInputChange = (state : React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      state(e.target.value);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{
    e.preventDefault();
    if(email === '' || password === ''){
      toast.error("Please fill in both fields.");
    }
    else{
      const response = await apiCall('user/connect',"POST",{
        email,
        password,
      })

      if (response?.ok) {
        const data = await response.json();
        TokenStore.setToken(data.token);
        navigate('/management');
      } else {
        toast.error("Failed to connect,try again");
      } 
    }
  }

  return (
    <div>
      <h2 className='title'>Connection</h2>
      <form 
        onSubmit={handleSubmit}    
      >
        <div>
          <input type="text" name="email" placeholder="xxx@xxx.com" value={email}
            onChange={handleInputChange(setEmail)} //generate a function from a function (result = (e)=>setLogin(e.target.value))
          />
        </div>
        <div>
          <input type="password" name="password" placeholder="@&p1"  value={password} className="input-field"
            onChange={handleInputChange(setPassword)} 
          />
        </div>
        <input type="submit" value="Connect"/>
      </form>
      {generateToastContainer()}
    </div>
    
  )
}

export default ConnectForm;