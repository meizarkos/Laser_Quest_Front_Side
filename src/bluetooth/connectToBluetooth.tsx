const BLUETOOTH_NAME = "LASER_QUEST";
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHARACTERISTIC_UUID = "abcdefab-1234-5678-9abc-abcdefabcdef"

async function connectToDevice() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: BLUETOOTH_NAME }],
      optionalServices: [SERVICE_UUID], 
    });

    if(!device.gatt) {
      throw new Error('Device does not support GATT');
    }
    const server = await device.gatt?.connect();

    // Get your service / characteristic
    const service = await server.getPrimaryService(SERVICE_UUID);
    const characteristic = await service?.getCharacteristic(CHARACTERISTIC_UUID);

    return {characteristic,device}; // Save it for read/write later
  } catch (error) {
    console.error('Connection failed', error);
  }
}

export {connectToDevice}