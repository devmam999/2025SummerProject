import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Settings: React.FC = () => {
  const [driveTimes, setDriveTimes] = useState<string[]>([]);
  const [foodPreference, setFoodPreference] = useState("");
  const [gasMileage, setGasMileage] = useState<number | "">("");
  const [numDays, setNumDays] = useState<number | "">("");
  const [avoidTolls, setAvoidTolls] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate hook

  const drivingOptions = ["Morning", "Afternoon", "Evening", "Night"];

  const toggleDriveTime = (time: string) => {
    setDriveTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      driveTimes,
      foodPreference,
      gasMileage,
      numDays,
      avoidTolls,
    };
    console.log(data);
    try {
      await fetch("http://localhost:8000/save-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      alert("Settings saved!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-lg shadow-md ring-1 ring-gray-200"
    >
      <h2 className="text-3xl font-extrabold text-[#049645] mb-8 text-center">
        Settings
      </h2>

      {/* Driving Times */}
      <fieldset className="mb-6">
        <legend className="text-lg font-semibold text-gray-700 mb-3">
          Preferred driving times:
        </legend>
        <div className="flex flex-wrap gap-4">
          {drivingOptions.map((time) => (
            <label
              key={time}
              className="flex items-center cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={driveTimes.includes(time)}
                onChange={() => toggleDriveTime(time)}
                className="w-5 h-5 text-[#8BC34A] border-gray-300 rounded focus:ring-[#7cb342] focus:ring-2"
              />
              <span className="ml-2 text-gray-800 font-medium">{time}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Food Preference */}
      <label className="block mb-6">
        <span className="text-lg font-semibold text-gray-700">
          Food preference:
        </span>
        <select
          className="mt-2 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-[#7cb342] focus:ring-1 focus:ring-[#7cb342]"
          value={foodPreference}
          onChange={(e) => setFoodPreference(e.target.value)}
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

      {/* Gas Mileage */}
      <label className="block mb-6">
        <span className="text-lg font-semibold text-gray-700">Gas Mileage (MPG):</span>
        <input
          type="number"
          value={gasMileage}
          onChange={(e) => setGasMileage(e.target.valueAsNumber)}
          placeholder="Enter your gas mileage in miles per gallon"
          required
          className="mt-2 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm placeholder-gray-400 focus:border-[#7cb342] focus:ring-1 focus:ring-[#7cb342]"
        />
      </label>

      {/* Number of Days */}
      <label className="block mb-8">
        <span className="text-lg font-semibold text-gray-700">Number of days:</span>
        <input
          type="number"
          min={1}
          value={numDays}
          onChange={(e) => setNumDays(Number(e.target.value))}
          required
          className="mt-2 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm placeholder-gray-400 focus:border-[#7cb342] focus:ring-1 focus:ring-[#7cb342]"
        />
      </label>
      {/* Avoid Tolls */}
      <label className="block mb-6">
      <div className="flex items-center">
        <span className="text-lg font-semibold text-gray-700 mr-3">Avoid Tolls?</span>
        <input
          type="checkbox"
          checked={avoidTolls}
          onChange={(e) => setAvoidTolls(e.target.checked)}
          className="h-5 w-5 text-[#7cb342] border-gray-300 rounded focus:ring-[#7cb342]"
        />
      </div>
    </label>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-[#8BC34A] text-white font-bold py-3 rounded-lg hover:bg-[#7cb342] focus:outline-none focus:ring-2 focus:ring-[#7cb342] transition"
      >
        Save Settings
      </button>
    </form>
  );
};

export default Settings;