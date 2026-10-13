import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function UserProfile() {
  const { username } = useParams();
  const [state, setState] = useState({ status: 'loading', user: null, repos: [], error: '' });
  const { isFavorite, toggle } = useFavorites();

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', user: null, repos: [], error: '' });
    const opts = { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } };

    Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, opts),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`, opts),
    ])
      .then(async ([u, r]) => {
        if (u.status === 404) throw new Error(`No GitHub user named “${username}”.`);
        if (u.status === 403 || u.status === 429) throw new Error('GitHub rate limit reached. Try again shortly.');
        if (!u.ok) throw new Error(`Request failed (${u.status}).`);
        return { user: await u.json(), repos: r.ok ? await r.json() : [] };
      })
      .then(({ user, repos }) => setState({ status: 'success', user, repos, error: '' }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState({ status: 'error', user: null, repos: [], error: err instanceof TypeError ? 'Network error.' : err.message });
      });
    return () => controller.abort();
  }, [username]);

  if (state.status === 'loading') return <p className="status" role="status"><span className="spinner" aria-hidden="true" /> Loading profile…</p>;
  if (state.status === 'error') {
    return (
      <div>
        <p className="status error" role="alert">{state.error}</p>
        <Link className="btn ghost" to="/explore">← Back to search</Link>
      </div>
    );
  }

  const { user, repos } = state;
  const fav = isFavorite(user.id);
  return (
    <article className="profile">
      <Link to="/explore" className="muted">← Back to search</Link>
      <div className="profile-head">
        <img src={user.avatar_url} alt={`${user.login}'s avatar`} width="96" height="96" />
        <div>
          <h1>{user.name || user.login}</h1>
          <a href={user.html_url} target="_blank" rel="noreferrer">@{user.login}</a>
          {user.bio && <p>{user.bio}</p>}
        </div>
        <button className={fav ? 'btn' : 'btn ghost'} aria-pressed={fav} onClick={() => toggle(user)}>
          {fav ? '★ Favorited' : '☆ Add to favorites'}
        </button>
      </div>
      <ul className="stat-row">
        <li><strong>{user.public_repos}</strong> repos</li>
        <li><strong>{user.followers}</strong> followers</li>
        <li><strong>{user.following}</strong> following</li>
      </ul>
      <h2>Recently updated</h2>
      {repos.length === 0 ? <p className="muted">No public repositories.</p> : (
        <ul className="repo-list">
          {repos.map((r) => (
            <li key={r.id}>
              <a href={r.html_url} target="_blank" rel="noreferrer">{r.name}</a>
              <span className="muted">{r.language || '—'} · ★ {r.stargazers_count}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
