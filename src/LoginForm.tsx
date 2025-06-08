import { useState } from 'react';
import './LoginForm.css';
import { IUser } from '../user.interface';

export interface LoginFormProps {
  login?: string;
  password?: string;
  onLoggedIn?: (error?:Error,user?:IUser) => void;
}


function LoginForm(props : LoginFormProps){

  const  [login, setLogin] = useState<string>(props.login || '');
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
        id: Math.random().toString(36).substring(2, 15),
        login: login,
        password: password
      });
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}    
    >
      <div>
        <label htmlFor="login">Email:</label>
        <input type="text" name="login" placeholder="login" value={login}
          onChange={handleInputChange(setLogin)} //generate a function from a function (result = (e)=>setLogin(e.target.value))
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input type="password" name="password" placeholder="password"  value={password}
          onChange={handleInputChange(setPassword)} 
        />
      </div>
      <input type="submit" value="Login"/>
    </form>
  )
}

export default LoginForm;