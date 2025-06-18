import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn.tsx';
import SignUp from './pages/SignUp.tsx';
import Settings from './pages/Settings.tsx';

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn setAuthToken={setAuthToken} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;