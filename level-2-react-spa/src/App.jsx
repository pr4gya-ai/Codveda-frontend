import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';

// Code-split the heavier pages for fast navigation
const Explore = lazy(() => import('./pages/Explore.jsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.jsx'));
const Favorites = lazy(() => import('./pages/Favorites.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  const location = useLocation();
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Navbar />
      <main id="main" className="container">
        <Suspense fallback={<p className="status" role="status">Loading…</p>}>
          {/* key on pathname re-triggers the CSS page transition on every navigation */}
          <div key={location.pathname} className="page">
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/user/:username" element={<UserProfile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
      </main>
      <footer className="footer container">
        <p>DevFinder · Codveda Front-End internship · Level 2</p>
      </footer>
    </>
  );
}
