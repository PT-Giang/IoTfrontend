import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import { useDevices } from '../../context/DeviceContext';
import './TempHistory.css';

const columns = [
  { key: 'deviceId', label: 'Device ID' },
  { key: 'deviceName', label: 'Device Name' },
  {
    key: 'temperature',
    label: 'Temperature (°C)',
    render: (row) => `${row.temperature.toFixed(1)}°C`
  },
  {
    key: 'timestamp',
    label: 'Timestamp',
    render: (row) =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }).format(new Date(row.timestamp))
  }
];

function TempHistory() {
  const { temperatureHistory } = useDevices();

  return (
    <Card
      className="temp-history"
      title="Temperature History"
      action={<span aria-live="polite">{temperatureHistory.length} records</span>}
    >
      <p className="temp-history__note">
        Recent readings are logged automatically from mock sensor updates.
      </p>
      <Table columns={columns} rows={temperatureHistory} getRowKey={(row) => row.id} />
    </Card>
  );
}

export default TempHistory;
