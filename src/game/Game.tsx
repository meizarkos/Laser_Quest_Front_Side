import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Navigate, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { io, Socket } from 'socket.io-client';
import { apiCall } from '../utils/apiCall';
import TokenStore from '../utils/tokenStore';
import generateToastContainer from '../var/ToastContainer';
import Game from "../models/game";
import Color from "../models/color";
import Player from "../models/player";
import InviteForm from './InviteForm';
import './Game.css';

const GameApp: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [scores, setScores] = useState<{ [playerName: string]: number }>(() => {
    const id = window.location.pathname.split('/').pop();
    if (id) {
      const stored = localStorage.getItem(`lq_scores_${id}`);
      if (stored) return JSON.parse(stored);
    }
    return {};
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameData, setGameData] = useState<Game | null>(location.state?.gameData ?? null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [gameStopped, setGameStopped] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [loadingGameData, setLoadingGameData] = useState(false);
  const [lasers, setLasers] = useState<string[]>([]);
  const [loadingLasers, setLoadingLasers] = useState(false);
  const hasFetchedLasers = useRef(false);

  const navigate = useNavigate();
  const isGuest = !TokenStore.getToken();
  
  useEffect(() => {
    if (gameData && gameData.players) {
      syncScoresWithPlayers(gameData.players);
    }
  }, [gameData]);

  useEffect(() => {
    if (id && gameData) {
      const newSocket = io('http://145.223.34.159:3010');
      setSocket(newSocket);
      newSocket.emit('joinGame', id);

      newSocket.on('colorUpdate', (colorData: Color) => {
        const matchingPlayer = gameData.players.find(player => 
          player.color.hitColor === colorData.hitColor
        );

        if (matchingPlayer) {
          const newScore = (matchingPlayer.score || 0) + 1;
          updatePlayerScore(matchingPlayer.name, newScore);
          toast.success(`${matchingPlayer.name} score point !`);
        }
      });

      const handleGameStopped = (data: { gameId: string }) => {
        if (data.gameId === id) {
          setGameStopped(true);
          localStorage.removeItem('lq_game_id');
          localStorage.removeItem('lq_game_data');
          localStorage.removeItem('lq_player_name');
          localStorage.removeItem(`lq_scores_${id}`);
          toast.info("La partie a été stoppée.");
          setTimeout(() => navigate('/'), 2000);
        }
      };
      newSocket.on('gameStopped', handleGameStopped);

      return () => {
        newSocket.off('colorUpdate');
        newSocket.off('gameStopped', handleGameStopped);
        newSocket.disconnect();
      };
    }
  }, [id, gameData, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isInvite = params.get('invite') === '1';
    const storedGameId = localStorage.getItem('lq_game_id');
    const storedGameData = localStorage.getItem('lq_game_data');
    const storedPlayerName = localStorage.getItem('lq_player_name');
    if (isInvite && !(storedGameId && storedGameData && storedPlayerName)) {
      return;
    }
    if (!gameData && id) {
      if (storedGameId === id && storedGameData) {
        const parsedGameData = JSON.parse(storedGameData);
        setGameData(parsedGameData);
        setPlayerName(storedPlayerName);

        if (!parsedGameData.players.some((p: Player) => p.name === storedPlayerName)) {
          setAccessDenied(true);
        }
      }
      else {
        setAccessDenied(true);
      }
    }
    else if (gameData) {
      setPlayerName(storedPlayerName);
      if (!gameData.players.some((p: Player) => p.name === storedPlayerName)) {
        setAccessDenied(true);
      }
    }
  }, [gameData, id]);

  useEffect(() => {
    if (id && Object.keys(scores).length > 0) {
      localStorage.setItem(`lq_scores_${id}` , JSON.stringify(scores));
    }
  }, [scores, id]);

  useEffect(() => {
    const storedGameId = localStorage.getItem('lq_game_id');
    const storedGameData = localStorage.getItem('lq_game_data');
    const storedPlayerName = localStorage.getItem('lq_player_name');
    if (storedGameId && storedGameData && storedPlayerName) {
      if (storedGameId !== id) {
        window.location.href = `/game/${storedGameId}`;
      }
      else {
        setShowInviteForm(false);
      }
    }
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedGameId = localStorage.getItem('lq_game_id');
    const storedGameData = localStorage.getItem('lq_game_data');
    const storedPlayerName = localStorage.getItem('lq_player_name');
    if (params.get('invite') === '1' && gameData && !(storedGameId && storedGameData && storedPlayerName)) {
      setShowInviteForm(true);
    }
  }, [gameData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isInvite = params.get('invite') === '1';
    const storedGameId = localStorage.getItem('lq_game_id');
    const storedGameData = localStorage.getItem('lq_game_data');
    const storedPlayerName = localStorage.getItem('lq_player_name');

    if (isInvite && !(storedGameId && storedGameData && storedPlayerName) && !gameData && id) {
      setLoadingGameData(true);
      apiCall(`game/get-game/${id}`, 'GET', undefined).then(response => {
        if (response && response.ok) {
          response.json().then(data => {
            setGameData(data);
            setLoadingGameData(false);
            setShowInviteForm(true);
          });
        } 
        else {
          setLoadingGameData(false);
          setGameData(null);
        }
      }).catch(() => {
        setLoadingGameData(false);
        setGameData(null);
      });
    }
  }, [id, gameData]);

  useEffect(() => {
    if (id && socket) {
      const handlePlayerJoined = (data: { gameId: string, player: Player }) => {
        if (data.gameId === id) {
          setGameData(prev => {
            if (!prev) return prev;
            return { ...prev, players: [...prev.players, data.player] };
          });
        }
      };
      socket.on('playerJoined', handlePlayerJoined);
      return () => { socket.off('playerJoined', handlePlayerJoined); };
    }
  }, [id, socket]);

  useEffect(() => {
    const storedGameId = localStorage.getItem('lq_game_id');
    const storedGameData = localStorage.getItem('lq_game_data');
    const storedPlayerName = localStorage.getItem('lq_player_name');

    if (storedGameId && storedGameData && storedPlayerName && id && storedGameId === id) {
      apiCall(`game/get-game/${id}`, 'GET', undefined).then(response => {
        if (response && response.ok) {
          response.json().then(data => {
            setGameData(data);
            localStorage.setItem('lq_game_data', JSON.stringify(data));
          });
        }
      });
    }
  }, [id]);

  const syncScoresWithPlayers = (players: Player[]) => {
    let currentScores: { [playerName: string]: number } = {};
    if (id) {
      const stored = localStorage.getItem(`lq_scores_${id}`);
      if (stored) {
        currentScores = JSON.parse(stored);
      }
    }
    
    const newScores: { [playerName: string]: number } = {};
    players.forEach(player => {
      newScores[player.name] = currentScores[player.name] || 0;
    });

    setScores(newScores);
  };

  const handleStopGame = async () => {
    if (!id) return;
    try {
      const response = await apiCall('game/stop-game', 'POST', { gameId: id });
      if (response && response.ok) {
        // Game stoppé //
      }
      else {
        toast.error("Erreur lors de l'arrêt de la partie.");
      }
    } catch (e) {
      toast.error("Erreur lors de l'arrêt de la partie.");
    }
  };

  const handleCopyInviteLink = () => {
    const url = `${window.location.origin}/game/${id}?invite=1`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Guest Link copied !');
    });
  };

  const usedColors = gameData ? gameData.players.map(p => p.color.hitColor) : [];

  const handleInviteSubmit = async (name: string, color: string) => {
    if (!name.trim() || !color) return;
    setInviteLoading(true);
    try {
      const response = await apiCall(`game/get-game/${id}`, 'GET', undefined);
      let currentGame = gameData;
      if (response && response.ok) {
        currentGame = await response.json();
      }

      if (!currentGame) {
        toast.error("Error during fetch game.");
        setInviteLoading(false);
        return;
      }

      if (currentGame.players.some((p: Player) => p.color.hitColor === color)) {
        toast.error('This color is already take');
        setInviteLoading(false);
        return;
      }

      const newPlayer = { name, color: { hitColor: color } };
      const addPlayerRes = await apiCall('game/add-player', 'POST', { gameId: id, player: newPlayer });
      let updatedGameData = currentGame;

      if (addPlayerRes && addPlayerRes.ok) {
        updatedGameData = await addPlayerRes.json();
        setGameData(updatedGameData);
      }
      else {
        toast.error("Error during adding player in the game");
        setInviteLoading(false);
        return;
      }

      localStorage.setItem('lq_game_id', id!);
      localStorage.setItem('lq_game_data', JSON.stringify(updatedGameData));
      localStorage.setItem('lq_player_name', name);
      window.location.href = `/game/${id}`;
    }
    catch (e) {
      toast.error("Error during adding player in the game");
    }
    finally {
      setInviteLoading(false);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const isInvite = params.get('invite') === '1';

  const updatePlayerScore = async (playerName: string, newScore: number) => {
    if (!id) return;
    await apiCall('game/update-score', 'POST', { gameId: id, playerName, score: newScore });
  };

  useEffect(() => {
    if (id && socket) {
      const handleScoreUpdated = (data: { gameId: string, playerName: string, score: number }) => {
        if (data.gameId === id) {
          setGameData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              players: prev.players.map(p =>
                p.name === data.playerName ? { ...p, score: data.score } : p
              )
            };
          });
        }
      };

      socket.on('scoreUpdated', handleScoreUpdated);
      return () => { socket.off('scoreUpdated', handleScoreUpdated); };
    }
  }, [id, socket]);

  useEffect(() => {
    // On ne fetch qu'une fois
    if (!showInviteForm || hasFetchedLasers.current) return;
    hasFetchedLasers.current = true;
    const fetchLasers = async () => {
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
                  setLasers(data.lasers);
                  break;
                }
              } catch (e) {}
            }
          }
        }
      } catch (e) {}
      setLoadingLasers(false);
    };
    fetchLasers();
  }, [showInviteForm]);

  if (accessDenied && !(isInvite && showInviteForm)) {
    return (
      <div className="game-container">
        <div className="error-screen">
          <h1>Acces denied</h1>
          <p>You are not member of this game</p>
        </div>
      </div>
    );
  }
  if (loadingGameData) {
    return (
      <div className="game-container">
        <div className="error-screen">
          <h1>Loading game...</h1>
        </div>
      </div>
    );
  }
  if (!gameData && !(isInvite && loadingGameData)) {
    return (
      <div className="game-container">
        <div className="error-screen">
          <h1>Game not found</h1>
          <p>You can start a new game in the managment page, if you have an account</p>
        </div>
      </div>
    );
  }
  if (gameStopped) {
    return (
      <div className="game-container">
        <div className="error-screen">
          <h1>Game stopped by the admin</h1>
          <p>You will be redirected at home...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="game-container">
      {generateToastContainer()}
      {!isGuest && (
        <div className="action-buttons">
          <button className="stop-game-btn" onClick={handleStopGame}>Stop game</button>
          <button className="invite-link-btn" onClick={handleCopyInviteLink}>Copy guest link</button>
        </div>
      )}
      {showInviteForm && !localStorage.getItem('lq_game_id') && gameData && (
        <div className="invite-form-modal">
          <InviteForm
            onSubmit={handleInviteSubmit}
            usedColors={usedColors}
            loading={inviteLoading}
            showBluetoothSection={!TokenStore.getToken() || (!loadingLasers && lasers.length === 0)}
          />
        </div>
      )}
      <div className={`game-players-area layout-${gameData ? gameData.players.length : 0}`}>
        {gameData && gameData.players.map((player, index) => (
          <div
            key={player.name}
            className="player-game-area"
            style={{ backgroundColor: player.color.hitColor }}
          >
            <div className="player-game-content">
              <h1 className="player-game-name">{player.name}</h1>
              <div className="player-score">
                <span className="score-label">Score :</span>
                <span className="score-value">{player.score ?? 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameApp;