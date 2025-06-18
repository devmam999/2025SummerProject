import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [driveTimes, setDriveTimes] = useState<string[]>([]);
  const [foodPreference, setFoodPreference] = useState('');
  const [carModel, setCarModel] = useState('');
  const [numDays, setNumDays] = useState<number | ''>('');

  const drivingOptions = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const toggleDriveTime = (time: string) => {
    setDriveTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
    driveTimes,
    foodPreference,
    carModel,
    numDays,
    };
    console.log(data);
    try {
      await fetch('http://localhost:8000/save-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Optional: add auth token here if you want to secure it
      },
      body: JSON.stringify(data),
      });

    alert('Settings saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[400px] mx-auto p-5">
      <h2>Settings</h2>

      <label>
        Preferred driving times:
        <div>
          {drivingOptions.map(time => (
            <label key={time} className="block">
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

      <label className="block mt-4">
        Food preference:
        <select
          className="block mt-1 w-full"
          value={foodPreference}
          onChange={e => setFoodPreference(e.target.value)}
          required
        >
          <option value="" disabled>
            Select one
          </option>
          <option value="packed food">Packed Food</option>
          <option value="fast food">Fast Food</option>
          <option value="fine dining">Fine Dining</option>
        </select>
      </label>

      <label className="block mt-4">
        Car model:
        <input
          type="text"
          value={carModel}
          onChange={e => setCarModel(e.target.value)}
          placeholder="Enter your car model"
          required
          className="block mt-1 w-full"
        />
      </label>

      <label className="block mt-4">
        Number of days:
        <input
          type="number"
          min={1}
          value={numDays}
          onChange={e => setNumDays(Number(e.target.value))}
          required
          className="block mt-1 w-full"
        />
      </label>

      <button
        type="submit"
        className="mt-5 px-5 py-2.5 cursor-pointer font-bold"
      >
        Save Settings
      </button>
    </form>
  );
};

export default Settings;
