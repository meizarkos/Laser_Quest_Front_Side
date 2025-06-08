const BLUETOOTH_NAME = "LASER_QUEST";
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHARACTERISTIC_UUID = "abcdefab-1234-5678-9abc-abcdefabcdef"

async function connectToDevice() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: BLUETOOTH_NAME }],
      optionalServices: [SERVICE_UUID], 
    });

    console.log('Device selected:', device.name);

    if(!device.gatt) {
      throw new Error('Device does not support GATT');
    }
    const server = await device.gatt?.connect();

    // Get your service
    const service = await server.getPrimaryService(SERVICE_UUID);

    // Get characteristic (for example, writable characteristic)
    const characteristic = await service?.getCharacteristic(CHARACTERISTIC_UUID);

    console.log('Connected to characteristic');

    return characteristic; // Save it for read/write later
  } catch (error) {
    console.error('Connection failed', error);
  }
}

export {connectToDevice}