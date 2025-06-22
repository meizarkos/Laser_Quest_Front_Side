import React, { useState } from "react";
import { toast } from 'react-toastify';
import PlayerForm from "./PlayerForm";
import './SetupGame.css';
import { apiCall } from "../utils/apiCall";
import { useNavigate } from "react-router-dom";
import Player from '../models/player';

const GAME_COLORS = ['red', 'green', 'blue', 'yellow', 'white'];
const DEFAULT_COLOR = '#2c3e50';

type LocalPlayer = Player & { localId: number };

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<LocalPlayer[]>([
    { localId: Date.now(), name: '', color: { hitColor: DEFAULT_COLOR } }
  ]);

  const handleAddPlayer = () => {
    if (players.length >= 4) return;
    const availableColor = GAME_COLORS.find(c => !players.map(p => p.color.hitColor).includes(c));
    setPlayers(prevPlayers => [
      ...prevPlayers,
      { localId: Date.now() + Math.random(), name: '', color: { hitColor: availableColor || DEFAULT_COLOR } }
    ]);
  }

  const handleUpdatePlayer = (localId: number, updates: Partial<Player>) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(p => (p.localId === localId ? { ...p, ...updates } : p))
    );
  }

  const handleStartGame = async () => {
    const payload = {
      players: players.map(({ name, color }) => ({ name, color }))
    }

    try {
      const response = await apiCall('game/start-game', 'POST', payload);
      if (response && response.ok) {
        const gameData = await response.json();
        toast.success(`Game created with ID: ${gameData.id}`);
        localStorage.setItem('lq_game_id', gameData.id);
        localStorage.setItem('lq_game_data', JSON.stringify(gameData));
        localStorage.setItem('lq_player_name', players[0].name);
        navigate(`/game/${gameData.id}`, { 
          state: { gameData: gameData }
        });
      }
      else {
        toast.error("Failed to start the game. The server responded with an error.");
      }
    }
    catch (error) {
      toast.error("Failed to start the game. Please try again.");
    }
  }

  const selectedColors = players.map(p => p.color.hitColor).filter(c => GAME_COLORS.includes(c));
  const isGameReady = players.length > 0 && players.every(p => p.name.trim() !== '' && GAME_COLORS.includes(p.color.hitColor));

  return (
    <div className="game-container">
      <div className={`players-area layout-${players.length}`}>
        {players.map((player) => (
          <PlayerForm
            key={player.localId}
            player={player}
            onUpdatePlayer={(_, updates) => handleUpdatePlayer(player.localId, updates)}
            allColors={GAME_COLORS}
            selectedColors={selectedColors}
          />
        ))}
      </div>
      <div className="game-actions">
        {players.length < 4 && (
          <button className="add-player-btn" onClick={handleAddPlayer}>+</button>
        )}
        <button className="start-game-btn" disabled={!isGameReady} onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    </div>
  );
}

export default Game;
