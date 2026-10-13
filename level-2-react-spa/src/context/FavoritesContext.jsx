import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const FavoritesContext = createContext(null);
const KEY = 'devfinder:favorites';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

// Global state shared across all pages (Home, Explore, Favorites, ...)
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(favorites));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [favorites]);

  const toggle = useCallback((user) => {
    setFavorites((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, { id: user.id, login: user.login, avatar_url: user.avatar_url, html_url: user.html_url }]
    );
  }, []);

  const isFavorite = useCallback((id) => favorites.some((u) => u.id === id), [favorites]);

  const value = useMemo(() => ({ favorites, toggle, isFavorite }), [favorites, toggle, isFavorite]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}
