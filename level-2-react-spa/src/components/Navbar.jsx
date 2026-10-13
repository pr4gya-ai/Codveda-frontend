import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { favorites } = useFavorites();
  const close = () => setOpen(false);
  const cls = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <header className="header">
      <nav className="nav container" aria-label="Primary">
        <Link to="/" className="brand" onClick={close}>
          <span className="dot" aria-hidden="true" /> DevFinder
        </Link>
        <button
          className="burger"
          aria-expanded={open}
          aria-controls="menu"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>
        <ul id="menu" className={open ? 'menu open' : 'menu'}>
          <li><NavLink to="/" end className={cls} onClick={close}>Home</NavLink></li>
          <li><NavLink to="/explore" className={cls} onClick={close}>Explore</NavLink></li>
          <li>
            <NavLink to="/favorites" className={cls} onClick={close}>
              Favorites <span className="badge" aria-label={`${favorites.length} saved`}>{favorites.length}</span>
            </NavLink>
          </li>
          <li><NavLink to="/about" className={cls} onClick={close}>About</NavLink></li>
          <li><NavLink to="/contact" className={cls} onClick={close}>Contact</NavLink></li>
        </ul>
      </nav>
    </header>
  );
}
