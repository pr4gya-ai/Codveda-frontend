import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  function onSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const next = {};
    if (!data.name.trim()) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) next.email = 'Enter a valid email.';
    if (data.message.trim().length < 10) next.message = 'Message should be at least 10 characters.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSent(true);
      e.currentTarget.reset();
    } else {
      setSent(false);
    }
  }

  return (
    <section className="prose">
      <h1>Contact</h1>
      <form className="contact" onSubmit={onSubmit} noValidate>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" aria-invalid={!!errors.name} />
        {errors.name && <p className="error" role="alert">{errors.name}</p>}
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" aria-invalid={!!errors.email} />
        {errors.email && <p className="error" role="alert">{errors.email}</p>}
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="4" aria-invalid={!!errors.message} />
        {errors.message && <p className="error" role="alert">{errors.message}</p>}
        <button className="btn" type="submit">Send</button>
        {sent && <p className="success" role="status">Thanks! Your message was sent (demo — nothing leaves your browser).</p>}
      </form>
    </section>
  );
}
