export default function About() {
  return (
    <section className="prose">
      <h1>About</h1>
      <p>
        DevFinder is a small single-page application built for the Codveda Front-End internship (Level 2).
        It demonstrates client-side routing with React Router, shared state with the Context API, and
        integration with the public GitHub REST API.
      </p>
      <h2>Under the hood</h2>
      <ul>
        <li>React 18 + Vite, route-level code splitting with <code>React.lazy</code></li>
        <li>React Router v6 (nested params, search params, NavLink)</li>
        <li>Favorites kept in Context and persisted to <code>localStorage</code></li>
        <li>Debounced search, request cancellation with <code>AbortController</code></li>
      </ul>
    </section>
  );
}
