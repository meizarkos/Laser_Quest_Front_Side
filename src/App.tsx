import './App.css';
import ConnectForm from './connection/ConnectForm';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const gameId = localStorage.getItem('lq_game_id');
    const gameData = localStorage.getItem('lq_game_data');
    const playerName = localStorage.getItem('lq_player_name');
    if (gameId && gameData && playerName) {
      try {
        const parsedGameData = JSON.parse(gameData);
        if (parsedGameData.players.some((p: any) => p.name === playerName)) {
          navigate(`/game/${gameId}`);
        }
      } catch (e) {}
    }
  }, []);
  return (
    <ConnectForm />
  );
}

export default App;
