import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { connectToDevice } from '../bluetooth/connectToBluetooth';
import { IWifi } from '../bluetooth/wifi.interface';
import TokenStore from '../utils/tokenStore';
import './InviteForm.css';

interface InviteFormProps {
  onSubmit: (name: string, color: string) => void;
  usedColors: string[];
  loading: boolean;
  showBluetoothSection: boolean;
}

const SUCCESS = "Success";
const FAILURE = "Failure";

const InviteForm: React.FC<InviteFormProps> = ({ 
  onSubmit, 
  usedColors, 
  loading, 
  showBluetoothSection 
}) => {
  const [inviteName, setInviteName] = useState('');
  const [inviteColor, setInviteColor] = useState('');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | undefined>(undefined);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wifiConnectionState, setWifiConnectionState] = useState<String | undefined>(undefined);
  const [showWifiForm, setShowWifiForm] = useState(false);
  const [showLaserModal, setShowLaserModal] = useState(false);

  const GAME_COLORS = ['red', 'green', 'blue', 'yellow', 'white'];

  const handleCharacteristicValueChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic | null;
    const value = new TextDecoder().decode(target?.value?.buffer || new ArrayBuffer(0));
    console.log(`Received value: '${value}' (length: ${value.length})`);
    if(value === SUCCESS){
      toast.success("Votre laser est maintenant connecté au WiFi!");
      setWifiConnectionState(SUCCESS);
    } else {
      toast.error("Votre laser n'a pas pu se connecter au WiFi. Vérifiez les identifiants.");
      setWifiConnectionState(FAILURE);
    }
  };

  useEffect(() => {
    if (!characteristic) return;

    characteristic.startNotifications().then(() => {
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    });

    return () => {
      characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    };
  }, [characteristic]);

  useEffect(() => {
    return () => {
      if (bluetoothDevice?.gatt?.connected) {
        bluetoothDevice.gatt.disconnect();
        console.log("Disconnected from Bluetooth device on page leave");
      }
    };
  }, [bluetoothDevice]);

  const sendWifiCred = async (error?: Error, wifi?: IWifi) => {
    if (characteristic && wifi) {
      const dataToSend = JSON.stringify(wifi);
      const encoder = new TextEncoder();
      const encoded = encoder.encode(dataToSend);

      try {
        await characteristic.writeValue(encoded);
        toast.info("Envoi des identifiants WiFi au laser, attendez un moment...", {
          autoClose: false,
        });
      } catch (err) {
        console.error('Failed to send data:', err);
        toast.error("Erreur lors de l'envoi des données");
      }
    } else {
      console.warn("Characteristic not connected yet");
    }
  };

  const handleDisconnectBle = () => {
    setCharacteristic(undefined);
    setBluetoothDevice(undefined);
    setShowWifiForm(false);
    toast.info("Appareil Bluetooth déconnecté. Veuillez vous reconnecter.");
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectToDevice();
      if (result?.characteristic) {
        await result.characteristic.startNotifications();
        setCharacteristic(result.characteristic);
        setBluetoothDevice(result.device);
        result.device.removeEventListener('gattserverdisconnected', handleDisconnectBle);
        result.device.addEventListener('gattserverdisconnected', handleDisconnectBle);
        
        toast.success("Connecté à l'appareil Bluetooth avec succès!");
        setShowWifiForm(true);
      } else if(characteristic && bluetoothDevice) {
        toast.info("Aucun changement dans la connexion actuelle.");
      } else {
        toast.error("Connexion Bluetooth annulée.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Échec de la connexion. Veuillez réessayer.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWifiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(ssid === '' || password === '') {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    
    sendWifiCred(undefined, {
      ssid,
      password,
      token: TokenStore.getToken() || ''
    });
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteColor) return;
    onSubmit(inviteName, inviteColor);
  };

  // MODAL LASER
  const closeLaserModal = () => {
    setShowLaserModal(false);
    setCharacteristic(undefined);
    setBluetoothDevice(undefined);
    setShowWifiForm(false);
    setWifiConnectionState(undefined);
    setSsid('');
    setPassword('');
  };

  return (
    <div className="invite-form">
      <h2>Rejoindre la partie</h2>
      
      {showBluetoothSection && (
        <button
          type="button"
          className="bluetooth-connect-btn"
          style={{ marginBottom: 24, maxWidth: 300 }}
          onClick={() => setShowLaserModal(true)}
        >
          Configurer un laser
        </button>
      )}

      <div className="player-form-section">
        <h3>Informations du joueur</h3>
        <form onSubmit={handleInviteSubmit}>
          <input
            type="text"
            placeholder="Votre nom"
            value={inviteName}
            onChange={e => setInviteName(e.target.value)}
            maxLength={15}
            required
          />
          
          <div className="color-palette">
            {GAME_COLORS.map(color => {
              const isUsed = usedColors.includes(color);
              return (
                <div
                  key={color}
                  className={`color-swatch${inviteColor === color ? ' selected' : ''}${isUsed ? ' disabled' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => !isUsed && setInviteColor(color)}
                />
              );
            })}
          </div>
          
          <button type="submit" disabled={!inviteName.trim() || !inviteColor || loading}>
            {loading ? 'Connexion...' : 'Rejoindre'}
          </button>
        </form>
      </div>

      {/* MODAL LASER */}
      {showLaserModal && (
        <div className="modal-overlay">
          <div className="modal-laser-config">
            <button className="modal-close-btn" onClick={closeLaserModal} title="Fermer">×</button>
            <h3>Configuration du laser</h3>
            <p>Connectez votre laser ESP32 pour participer</p>
            
            {!characteristic && (
              <button
                type="button"
                className="bluetooth-connect-btn"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connexion...' : 'Connecter un laser ESP32'}
              </button>
            )}

            {characteristic && showWifiForm && (
              <div className="wifi-form-section">
                <h4>Configuration WiFi</h4>
                <form onSubmit={handleWifiSubmit}>
                  <input
                    type="text"
                    placeholder="Nom du réseau WiFi"
                    value={ssid}
                    onChange={e => setSsid(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Mot de passe WiFi"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="wifi-submit-btn">
                    Configurer le WiFi
                  </button>
                </form>
              </div>
            )}

            {wifiConnectionState === SUCCESS && (
              <div className="wifi-success">
                <p>✅ Votre laser est connecté au WiFi!</p>
              </div>
            )}

            {wifiConnectionState === FAILURE && (
              <div className="wifi-failure">
                <p>❌ Échec de la connexion WiFi. Vérifiez les identifiants.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteForm; 