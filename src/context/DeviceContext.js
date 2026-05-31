import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const DeviceContext = createContext(null);

const initialLights = [
  { id: 'light-living', name: 'Living Room Lamp', room: 'Living Room', isOn: true },
  { id: 'light-kitchen', name: 'Kitchen Ceiling', room: 'Kitchen', isOn: false },
  { id: 'light-bedroom', name: 'Bedroom Strip', room: 'Bedroom', isOn: true },
  { id: 'light-porch', name: 'Porch Light', room: 'Outdoor', isOn: false }
];

const initialSensors = [
  { id: 'temp-living', name: 'Living Room Sensor', room: 'Living Room', temperature: 22.4 },
  { id: 'temp-kitchen', name: 'Kitchen Sensor', room: 'Kitchen', temperature: 24.1 },
  { id: 'temp-bedroom', name: 'Bedroom Sensor', room: 'Bedroom', temperature: 21.8 }
];

function createHistoryEntry(sensor) {
  return {
    id: `${sensor.id}-${Date.now()}`,
    deviceId: sensor.id,
    deviceName: sensor.name,
    temperature: sensor.temperature,
    timestamp: new Date().toISOString()
  };
}

export function DeviceProvider({ children }) {
  const [lights, setLights] = useState(initialLights);
  const [temperatureSensors, setTemperatureSensors] = useState(initialSensors);
  const [temperatureHistory, setTemperatureHistory] = useState(
    initialSensors.map((sensor, index) => ({
      ...createHistoryEntry(sensor),
      id: `${sensor.id}-initial-${index}`
    }))
  );

  const toggleLight = useCallback((lightId) => {
    setLights((currentLights) =>
      currentLights.map((light) =>
        light.id === lightId ? { ...light, isOn: !light.isOn } : light
      )
    );

    // Replace this optimistic local update with a REST call later:
    // await fetch(`/api/lights/${lightId}/toggle`, { method: 'POST' });
  }, []);

  useEffect(() => {
    // Mock live updates. Replace this interval with a WebSocket subscription later:
    // const socket = new WebSocket(process.env.REACT_APP_DEVICE_STREAM_URL);
    // socket.onmessage = (event) => append incoming temperature payloads.
    const intervalId = window.setInterval(() => {
      setTemperatureSensors((currentSensors) => {
        const nextSensors = currentSensors.map((sensor) => {
          const delta = Number((Math.random() * 0.6 - 0.3).toFixed(1));
          return {
            ...sensor,
            temperature: Number((sensor.temperature + delta).toFixed(1))
          };
        });

        const changedSensor = nextSensors[Math.floor(Math.random() * nextSensors.length)];
        setTemperatureHistory((currentHistory) =>
          [createHistoryEntry(changedSensor), ...currentHistory].slice(0, 12)
        );

        return nextSensors;
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const value = useMemo(
    () => ({
      lights,
      temperatureSensors,
      temperatureHistory,
      toggleLight
    }),
    [lights, temperatureSensors, temperatureHistory, toggleLight]
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevices() {
  const context = useContext(DeviceContext);

  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }

  return context;
}
