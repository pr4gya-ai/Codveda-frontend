import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Home() {
  const { favorites } = useFavorites();
  return (
    <section className="hero">
      <p className="eyebrow">React · React Router · Context API</p>
      <h1>Find developers on <span className="grad">GitHub</span></h1>
      <p className="lead">
        Search profiles with a debounced live search, open a profile, and save favorites that persist across pages.
      </p>
      <div className="actions">
        <Link className="btn" to="/explore">Start exploring</Link>
        <Link className="btn ghost" to="/favorites">
          Favorites ({favorites.length})
        </Link>
      </div>
      <ul className="features">
        <li><h3>No page reloads</h3><p>Client-side routing with lazy-loaded pages.</p></li>
        <li><h3>Shared state</h3><p>Favorites live in React Context and localStorage.</p></li>
        <li><h3>Resilient</h3><p>Loading, empty, rate-limit and error states handled.</p></li>
      </ul>
    </section>
  );
}
