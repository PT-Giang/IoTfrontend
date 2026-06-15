import { Droplets, Lightbulb, ThermometerSun } from 'lucide-react';
import Card from '../../components/Card/Card';
import Toggle from '../../components/Toggle/Toggle';
import { useDevices } from '../../context/DeviceContext';
import './DeviceManager.css';

function DeviceManager() {
  const { lights, temperatureSensors, toggleLight } = useDevices();

  return (
    <section className="device-manager" aria-label="Device manager">
      <Card title="Light Control">
        <div className="device-list">
          {lights.map((light) => (
            <article
              className={`device-row ${light.isOn ? 'device-row--active' : ''}`}
              key={light.id}
            >
              <div className="device-row__summary">
                <span className="device-row__icon" aria-hidden="true">
                  <Lightbulb size={20} />
                </span>
                <div>
                  <h3>{light.name}</h3>
                  <p>{light.room}</p>
                </div>
              </div>
              <Toggle
                checked={light.isOn}
                id={`${light.id}-toggle`}
                label={`Turn ${light.name} ${light.isOn ? 'off' : 'on'}`}
                onChange={() => toggleLight(light.id)}
              />
            </article>
          ))}
        </div>
      </Card>

      <Card title="Temperature Monitor" className="temperature-card">
        <div className="sensor-list">
          {temperatureSensors.map((sensor) => (
            <article className="sensor-row" key={sensor.id}>
              <div className="sensor-row__summary">
                <span className="sensor-row__icon" aria-hidden="true">
                  <ThermometerSun size={20} />
                </span>
                <div>
                  <h3>{sensor.name}</h3>
                  <p>{sensor.room}</p>
                </div>
              </div>
              <div className="sensor-row__readings" aria-label={`${sensor.name} readings`}>
                <strong>{sensor.temperature.toFixed(1)}°C</strong>
                <span>
                  <Droplets size={16} aria-hidden="true" />
                  {sensor.humidity ?? '--'}%
                </span>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </section>
  );
}

export default DeviceManager;
