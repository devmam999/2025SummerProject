import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth'; // Import User type and onAuthStateChanged
import { auth } from './authentication'; // Import the auth instance from your authentication.ts file

// Import your page components
import SignIn from './pages/SignIn.tsx';
import SignUp from './pages/SignUp.tsx';
import Settings from './pages/Settings.tsx';
import Dashboard from './pages/Dashboard.tsx';

function App() {
  const [user, setUser] = useState<User | null>(null); // State to hold the current authenticated user
  const [loading, setLoading] = useState(true); // State to track if auth state is still being determined

  useEffect(() => {
    // This listener runs whenever the user's sign-in state changes
    // and also immediately when the app initializes.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the user state
      setLoading(false); // Authentication state has been determined
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Show a loading indicator while checking the authentication state
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
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/signup" />} />
        <Route path="/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/settings"
          element={user ? <Settings /> : <Navigate to="/signin" replace />}
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/signin"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;