import React from 'react';
import './PlayerForm.css';
import Player from '../models/player';

interface PlayerFormProps {
  player: Player;
  onUpdatePlayer: (name: string, updates: Partial<Player>) => void;
  allColors: string[];
  selectedColors: string[];
}

const PlayerForm: React.FC<PlayerFormProps> = ({ player, onUpdatePlayer, allColors, selectedColors }) => {
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
      </div>
    </div>
  );
};

export default PlayerForm;
