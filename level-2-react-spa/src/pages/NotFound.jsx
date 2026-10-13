import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="prose">
      <h1>404</h1>
      <p>That page doesn’t exist.</p>
      <Link className="btn" to="/">Go home</Link>
    </section>
  );
}
