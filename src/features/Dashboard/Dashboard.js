import { Activity, Home, Lightbulb, Thermometer, Wifi } from 'lucide-react';
import Card from '../../components/Card/Card';
import DeviceManager from '../DeviceManager/DeviceManager';
import TempHistory from '../TempHistory/TempHistory';
import { useDevices } from '../../context/DeviceContext';
import './Dashboard.css';

function Dashboard() {
  const { lights, temperatureSensors, temperatureHistory } = useDevices();
  const activeLights = lights.filter((light) => light.isOn).length;
  const averageTemperature =
    temperatureSensors.reduce((total, sensor) => total + sensor.temperature, 0) /
    temperatureSensors.length;

  const stats = [
    {
      label: 'Connected Devices',
      value: lights.length + temperatureSensors.length,
      icon: Wifi,
      tone: 'teal'
    },
    {
      label: 'Lights On',
      value: `${activeLights}/${lights.length}`,
      icon: Lightbulb,
      tone: 'gold'
    },
    {
      label: 'Avg. Temperature',
      value: `${averageTemperature.toFixed(1)}°C`,
      icon: Thermometer,
      tone: 'red'
    },
    {
      label: 'History Records',
      value: temperatureHistory.length,
      icon: Activity,
      tone: 'blue'
    }
  ];

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">
            <Home size={16} aria-hidden="true" />
            Home Assistant
          </p>
          <h1>IoT Control Dashboard</h1>
          <p className="dashboard__description">
            Monitor rooms, control smart lights, and review live temperature activity.
          </p>
        </div>
      </header>

      <section aria-label="Dashboard overview" className="dashboard__stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card className="stat-card" key={stat.label}>
              <div className={`stat-card__icon stat-card__icon--${stat.tone}`}>
                <Icon size={22} aria-hidden="true" />
              </div>
              <div>
                <p className="stat-card__label">{stat.label}</p>
                <strong className="stat-card__value">{stat.value}</strong>
              </div>
            </Card>
          );
        })}
      </section>

      <div className="dashboard__grid">
        <DeviceManager />
        <TempHistory />
      </div>
    </main>
  );
}

export default Dashboard;
