import { MouseEventHandler, useState } from 'react';
import './App.css';
import LoginForm from './LoginForm';
import { IUser } from '../user.interface';

function App() {

  const [user, setUser] = useState<IUser>();

  const onLoggedIn = (error?: Error, user?: IUser) => {
    console.log('onLoggedIn', error, user);
    setUser(user);
  }

  const handleClickApp: MouseEventHandler<HTMLButtonElement> = (e) => {
    setUser(undefined);
  }
  
  return (
    <div className="App">
      <p>Connexion svp</p>
      <LoginForm
        login="test"
        password="pass"
        onLoggedIn={onLoggedIn}
      />
      <br/>
      <LoginForm/>
      {
        user &&
        <div>
          <button onClick={handleClickApp}>Update all</button>
          <p>Hello user : {user.login}</p>
        </div>
      }
      
    </div>
  );
}

export default App;
