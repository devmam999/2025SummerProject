import React, { useState } from 'react';

const Settings: React.FC = () => {
  // State for each input
  const [driveTimes, setDriveTimes] = useState<string[]>([]);
  const [foodPreference, setFoodPreference] = useState('');
  const [carModel, setCarModel] = useState('');
  const [numDays, setNumDays] = useState<number | ''>('');

  // Driving times options
  const drivingOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];

  // Handle multi-select driving times (toggle)
  const toggleDriveTime = (time: string) => {
    setDriveTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can send data to backend or save it
    console.log({
      driveTimes,
      foodPreference,
      carModel,
      numDays,
    });
    alert('Settings saved!');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Settings</h2>

      <label>
        Preferred driving times:
        <div>
          {drivingOptions.map(time => (
            <label key={time} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={driveTimes.includes(time)}
                onChange={() => toggleDriveTime(time)}
              />
              {time}
            </label>
          ))}
        </div>
      </label>

      <label style={{ display: 'block', marginTop: 15 }}>
        Food preference:
        <select
          value={foodPreference}
          onChange={e => setFoodPreference(e.target.value)}
          required
          style={{ display: 'block', marginTop: 5, width: '100%' }}
        >
          <option value="" disabled>
            Select one
          </option>
          <option value="packed food">Packed Food</option>
          <option value="fast food">Fast Food</option>
          <option value="fine dining">Fine Dining</option>
        </select>
      </label>

      <label style={{ display: 'block', marginTop: 15 }}>
        Car model:
        <input
          type="text"
          value={carModel}
          onChange={e => setCarModel(e.target.value)}
          placeholder="Enter your car model"
          required
          style={{ display: 'block', marginTop: 5, width: '100%' }}
        />
      </label>

      <label style={{ display: 'block', marginTop: 15 }}>
        Number of days:
        <input
          type="number"
          min={1}
          value={numDays}
          onChange={e => setNumDays(Number(e.target.value))}
          required
          style={{ display: 'block', marginTop: 5, width: '100%' }}
        />
      </label>

      <button
        type="submit"
        style={{
          marginTop: 20,
          padding: '10px 20px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Save Settings
      </button>
    </form>
  );
};

export default Settings;
