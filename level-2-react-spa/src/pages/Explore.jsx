import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebounce from '../hooks/useDebounce.js';
import UserCard from '../components/UserCard.jsx';

const SORTS = [
  { value: '', label: 'Best match' },
  { value: 'followers', label: 'Most followers' },
  { value: 'repositories', label: 'Most repos' },
  { value: 'joined', label: 'Newest' },
];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get('q') || '');
  const [sort, setSort] = useState(params.get('sort') || '');
  const query = useDebounce(input.trim(), 450); // debounced — avoids a request per keystroke

  const [state, setState] = useState({ status: 'idle', users: [], total: 0, error: '' });

  // Keep the URL in sync so searches are shareable / survive back-navigation
  useEffect(() => {
    const next = {};
    if (query) next.q = query;
    if (sort) next.sort = sort;
    setParams(next, { replace: true });
  }, [query, sort, setParams]);

  useEffect(() => {
    if (!query) {
      setState({ status: 'idle', users: [], total: 0, error: '' });
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading', error: '' }));

    const url = new URL('https://api.github.com/search/users');
    url.searchParams.set('q', query);
    url.searchParams.set('per_page', '12');
    if (sort) url.searchParams.set('sort', sort);

    fetch(url, { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } })
      .then(async (res) => {
        if (res.status === 403 || res.status === 429) {
          throw new Error('GitHub rate limit reached. Please wait a minute and try again.');
        }
        if (!res.ok) throw new Error(`Request failed (${res.status}).`);
        return res.json();
      })
      .then((data) =>
        setState({ status: 'success', users: data.items, total: data.total_count, error: '' })
      )
      .catch((err) => {
        if (err.name === 'AbortError') return; // superseded by a newer search
        setState({
          status: 'error',
          users: [],
          total: 0,
          error: err instanceof TypeError ? 'Network error. Check your connection.' : err.message,
        });
      });

    return () => controller.abort(); // cancel stale request
  }, [query, sort]);

  const typing = input.trim() !== query;

  return (
    <section>
      <h1>Explore</h1>
      <div className="search-row">
        <label className="sr-only" htmlFor="q">Search GitHub users</label>
        <input
          id="q"
          type="search"
          placeholder="Search users, e.g. torvalds"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
        />
        <label className="sr-only" htmlFor="sort">Sort by</label>
        <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div aria-live="polite">
        {state.status === 'idle' && !typing && <p className="status">Type a name to start searching.</p>}
        {(state.status === 'loading' || typing) && input.trim() && (
          <p className="status" role="status"><span className="spinner" aria-hidden="true" /> Searching…</p>
        )}
        {state.status === 'error' && <p className="status error" role="alert">{state.error}</p>}
        {state.status === 'success' && !typing && (
          <>
            <p className="muted">{state.total.toLocaleString()} result{state.total === 1 ? '' : 's'} for “{query}”</p>
            {state.users.length === 0 ? (
              <p className="status">No users found. Try a different search.</p>
            ) : (
              <ul className="user-grid">
                {state.users.map((u) => <UserCard key={u.id} user={u} />)}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
