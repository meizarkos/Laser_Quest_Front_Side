import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Bluetooth from './bluetooth/Bluetooth';
import Management from './management/Management';
import SetupGame from './game/SetupGame';
import GameApp from './game/Game';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path='*' element={<Navigate to='/'/>}/>
        <Route path='/bluetooth' element={<Bluetooth/>}/>
        <Route path='/management' element={<Management/>} />
        <Route path='/setup-game' element={<SetupGame />} />
        <Route path='/game/:id' element={<GameApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
