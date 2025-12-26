/*import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdFeed from './components/AdFeed.jsx';
import AdForm from './components/AdForm.jsx';
import Login from './forms/Login.jsx';
import Register from './forms/Register.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdFeed />} />
        <Route path="/form" element={<AdForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;*/


/*import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdFeed from './components/AdFeed.jsx';
import AdForm from './components/AdForm.jsx';
import Login from './forms/Login.jsx';
import Register from './forms/Register.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>*/

        {/* Landing */}
        /*<Route path="/" element={<Navigate to="/login" replace />} />*/

        {/* Auth */}
        /*<Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />*/

        {/* App */}
        /*<Route path="/ads" element={<AdFeed />} />
        <Route path="/ads/new" element={<AdForm />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;*/




import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./forms/ProtectedRoute.jsx";

import AdFeed from "./pages/AdFeed.jsx";
import AdForm from "./components/AdForm.jsx";
import Login from "./forms/Login.jsx";
import Register from "./forms/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing page */}
        <Route path="/" element={<Login />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/ads"
          element={
            <ProtectedRoute>
              <AdFeed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ads/new"
          element={
            <ProtectedRoute>
              <AdForm />
            </ProtectedRoute>
          }
        />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route path="/oauth-success" element={<OAuthSuccess />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;

