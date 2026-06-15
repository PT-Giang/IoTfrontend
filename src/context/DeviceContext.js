import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const DeviceContext = createContext(null);

const REAL_LIGHT_ID = "light-living";
const REAL_LIGHT_DEVICE_KEY = "LIGHT_LIVING";
const REAL_CLIMATE_SENSOR_ID = "climate-living";
const POLLING_INTERVAL_MS = 5000;

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const host = process.env.REACT_APP_API_HOST || "localhost:8000";

  return `${protocol}://${host}`;
};

const initialLights = [
  {
    id: REAL_LIGHT_ID,
    apiDeviceKey: REAL_LIGHT_DEVICE_KEY,
    name: "Living Room Light",
    room: "Living Room",
    isOn: false,
    isRealDevice: true,
  },
  {
    id: "light-kitchen",
    name: "Kitchen Ceiling",
    room: "Kitchen",
    isOn: false,
    isRealDevice: false,
  },
  {
    id: "light-bedroom",
    name: "Bedroom Strip",
    room: "Bedroom",
    isOn: true,
    isRealDevice: false,
  },
  {
    id: "light-porch",
    name: "Porch Light",
    room: "Outdoor",
    isOn: false,
    isRealDevice: false,
  },
];

const initialSensors = [
  {
    id: REAL_CLIMATE_SENSOR_ID,
    name: "Living Room Climate Sensor",
    room: "Living Room",
    temperature: 0,
    humidity: 0,
    isRealDevice: true,
  },
  {
    id: "climate-kitchen",
    name: "Kitchen Climate Sensor",
    room: "Kitchen",
    temperature: 24.1,
    humidity: 52,
    isRealDevice: false,
  },
  {
    id: "climate-bedroom",
    name: "Bedroom Climate Sensor",
    room: "Bedroom",
    temperature: 21.8,
    humidity: 48,
    isRealDevice: false,
  },
];

function normalizeNumber(value, fallback = 0) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function createHistoryEntry(sensor) {
  return {
    id: `${sensor.id}-${Date.now()}`,
    deviceId: sensor.id,
    deviceName: sensor.name,
    temperature: sensor.temperature,
    humidity: sensor.humidity,
    timestamp: new Date().toISOString(),
  };
}

function applyDashboardStateToLights(currentLights, dashboardState) {
  const realLightStatus = dashboardState?.devices?.[REAL_LIGHT_DEVICE_KEY];

  if (typeof realLightStatus !== "boolean") {
    return currentLights;
  }

  return currentLights.map((light) =>
    light.id === REAL_LIGHT_ID ? { ...light, isOn: realLightStatus } : light,
  );
}

function applyDashboardStateToSensors(currentSensors, dashboardState) {
  const nextTemperature = normalizeNumber(dashboardState?.temperature);
  const nextHumidity = normalizeNumber(dashboardState?.humidity);

  return currentSensors.map((sensor) =>
    sensor.id === REAL_CLIMATE_SENSOR_ID
      ? {
          ...sensor,
          temperature: nextTemperature,
          humidity: nextHumidity,
        }
      : sensor,
  );
}

export function DeviceProvider({ children }) {
  const [lights, setLights] = useState(initialLights);
  const [temperatureSensors, setTemperatureSensors] = useState(initialSensors);
  const [temperatureHistory, setTemperatureHistory] = useState([]);

  const appendRealClimateHistory = useCallback((dashboardState) => {
    const historyEntry = createHistoryEntry({
      id: REAL_CLIMATE_SENSOR_ID,
      name: "Living Room Climate Sensor",
      temperature: normalizeNumber(dashboardState?.temperature),
      humidity: normalizeNumber(dashboardState?.humidity),
    });

    setTemperatureHistory((currentHistory) =>
      [historyEntry, ...currentHistory].slice(0, 12),
    );
  }, []);

  const fetchDashboardState = useCallback(
    async ({ shouldLogHistory = false } = {}) => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/dashboard`);

        if (!response.ok) {
          throw new Error(`Dashboard request failed with ${response.status}`);
        }

        const dashboardState = await response.json();

        setLights((currentLights) =>
          applyDashboardStateToLights(currentLights, dashboardState),
        );
        setTemperatureSensors((currentSensors) =>
          applyDashboardStateToSensors(currentSensors, dashboardState),
        );

        if (shouldLogHistory) {
          appendRealClimateHistory(dashboardState);
        }
      } catch (error) {
        console.error("Unable to fetch dashboard state", error);
      }
    },
    [appendRealClimateHistory],
  );

  const toggleLight = useCallback(async (lightId) => {
    const selectedLight = lights.find((light) => light.id === lightId);

    if (!selectedLight) {
      return;
    }

    const nextStatus = !selectedLight.isOn;

    if (!selectedLight.isRealDevice) {
      setLights((currentLights) =>
        currentLights.map((light) =>
          light.id === lightId ? { ...light, isOn: nextStatus } : light,
        ),
      );
      return;
    }

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/devices/light?status=${nextStatus}`,
        { method: "POST" },
      );

      if (!response.ok) {
        throw new Error(`Light update failed with ${response.status}`);
      }

      setLights((currentLights) =>
        currentLights.map((light) =>
          light.id === lightId ? { ...light, isOn: nextStatus } : light,
        ),
      );
    } catch (error) {
      console.error("Unable to update Living Room Light", error);
    }
  }, [lights]);

  useEffect(() => {
    fetchDashboardState();

    const intervalId = window.setInterval(() => {
      fetchDashboardState({ shouldLogHistory: true });
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchDashboardState]);

  const value = useMemo(
    () => ({
      lights,
      temperatureSensors,
      temperatureHistory,
      toggleLight,
    }),
    [lights, temperatureSensors, temperatureHistory, toggleLight],
  );

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);

  if (!context) {
    throw new Error("useDevices must be used within a DeviceProvider");
  }

  return context;
}
