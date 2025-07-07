import React, { useEffect, useState } from 'react';
import './PlayerForm.css';
import Player from '../models/player';
import { apiCall } from '../utils/apiCall';
import TokenStore from '../utils/tokenStore';

interface PlayerFormProps {
  player: Player;
  onUpdatePlayer: (name: string, updates: Partial<Player>) => void;
  allColors: string[];
  selectedColors: string[];
}

interface Laser {
  id: string;
  name: string;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ player, onUpdatePlayer, allColors, selectedColors }) => {
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [loadingLasers, setLoadingLasers] = useState(false);

  useEffect(() => {
    const fetchLasers = async () => {
      if (!TokenStore.getToken()) return;
      setLoadingLasers(true);
      try {
        const response = await apiCall('user/lasers', 'GET', null);
        if (response && response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              try {
                const data = JSON.parse(chunk);
                if (data?.lasers && Array.isArray(data.lasers)) {
                  setLasers(data.lasers.map((id: string) => ({ id, name: `Laser ${id}` })));
                  break; // On a ce qu'il faut, on arrête la lecture
                }
              } catch (error) {
                // Ignore les erreurs de parsing, continue
              }
            }
          }
        }
      } catch (e) {}
      setLoadingLasers(false);
    };
    fetchLasers();
  }, []);

  return (
    <div className="player-form" style={{ backgroundColor: player.color.hitColor }}>
      <div className="player-content">
        <h1 className="player-name">{player.name || 'Player'}</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={player.name}
          onChange={(e) => onUpdatePlayer(player.name, { name: e.target.value })}
          className="name-input"
          maxLength={15}
        />
        <div className="color-palette">
          {allColors.map((color) => {
            const isSelectedByOther = selectedColors.includes(color);
            const isMyColor = player.color.hitColor === color;
            const isDisabled = isSelectedByOther && !isMyColor;

            return (
              <div
                key={color}
                className={`color-swatch ${isMyColor ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => !isDisabled && onUpdatePlayer(player.name, { color: { hitColor: color } })}
              />
            );
          })}
        </div>
        <div style={{ marginTop: '1.5rem', width: '100%' }}>
          <label style={{ color: 'white', fontWeight: 500, marginBottom: 8, display: 'block' }}>Laser associé :</label>
          <select
            className="laser-select"
            value={player.laserId || ''}
            onChange={e => onUpdatePlayer(player.name, { laserId: e.target.value })}
            disabled={loadingLasers || (lasers.length === 0)}
          >
            <option value="" disabled>Sélectionner un laser</option>
            {lasers.map(laser => (
              <option key={laser.id} value={laser.id}>{laser.name}</option>
            ))}
          </select>
          {(!loadingLasers && lasers.length === 0) && (
            <div style={{ color: 'orange', marginTop: 8 }}>Aucun laser disponible</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerForm;
