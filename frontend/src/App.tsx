// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './authentication';

import SignIn from './pages/SignIn.tsx';
import SignUp from './pages/SignUp.tsx';
import Settings from './pages/Settings.tsx';
import Dashboard from './pages/Dashboard.tsx';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading authentication state...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/*
          Root path:
          If authenticated, go to dashboard.
          If not authenticated, go to signup.
        */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/signup" replace />} />

        {/* If user is already signed in, they shouldn't see sign-in forms */}
        <Route path="/signin" element={user ? <Navigate to="/dashboard" replace /> : <SignIn />} />

        {/*
          *** THE ACTUAL FIX FOR /signup ROUTE IN APP.TSX ***
          We will simply render the SignUp component here.
          The logic for redirecting an *already logged-in user* from the signup page,
          and the redirect to /settings after a fresh signup, will be handled *inside*
          the SignUp.tsx component itself. This avoids the race condition here.
        */}
        <Route path="/signup" element={<SignUp />} />


        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/settings"
          element={user ? <Settings /> : <Navigate to="/signin" replace />}
        />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/signin"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;