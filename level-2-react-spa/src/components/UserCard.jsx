import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function UserCard({ user }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(user.id);
  return (
    <li className="user-card">
      <img src={`${user.avatar_url}&s=96`} alt="" width="48" height="48" loading="lazy" />
      <div className="user-meta">
        <Link to={`/user/${user.login}`}>{user.login}</Link>
        <a className="muted" href={user.html_url} target="_blank" rel="noreferrer">github.com/{user.login}</a>
      </div>
      <button
        className={fav ? 'star on' : 'star'}
        aria-pressed={fav}
        aria-label={fav ? `Remove ${user.login} from favorites` : `Add ${user.login} to favorites`}
        onClick={() => toggle(user)}
      >
        {fav ? '★' : '☆'}
      </button>
    </li>
  );
}
