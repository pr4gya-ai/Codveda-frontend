import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import UserCard from '../components/UserCard.jsx';

export default function Favorites() {
  const { favorites } = useFavorites();
  return (
    <section>
      <h1>Favorites</h1>
      {favorites.length === 0 ? (
        <p className="status">Nothing saved yet. <Link to="/explore">Find some developers →</Link></p>
      ) : (
        <ul className="user-grid">
          {favorites.map((u) => <UserCard key={u.id} user={u} />)}
        </ul>
      )}
    </section>
  );
}
