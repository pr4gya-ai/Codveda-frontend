const form = document.getElementById('signup');
const success = document.getElementById('success');
const bar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

const validators = {
  name: (v) => {
    if (!v.trim()) return 'Name is required.';
    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(v.trim())) return 'Use letters, spaces, hyphens or apostrophes only.';
    return '';
  },
  email: (v) => {
    if (!v.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Enter a valid email like you@example.com.';
    return '';
  },
  phone: (v) => {
    if (!v.trim()) return 'Phone number is required.';
    const digits = v.replace(/[\s()-]/g, '');
    if (!/^\+?\d{10,14}$/.test(digits)) return 'Enter 10–14 digits, optionally starting with +.';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    if (!/[a-z]/.test(v)) return 'Add a lowercase letter.';
    if (!/[A-Z]/.test(v)) return 'Add an uppercase letter.';
    if (!/\d/.test(v)) return 'Add a number.';
    if (!/[^A-Za-z0-9]/.test(v)) return 'Add a symbol (e.g. ! @ #).';
    return '';
  },
  confirm: (v) => {
    if (!v) return 'Please confirm your password.';
    if (v !== form.elements.password.value) return 'Passwords do not match.';
    return '';
  },
};

const touched = new Set();

function showResult(name) {
  const input = form.elements[name];
  const wrap = input.closest('.field');
  const msg = validators[name](input.value);
  wrap.classList.toggle('invalid', !!msg);
  wrap.classList.toggle('valid', !msg && !!input.value);
  wrap.querySelector('.err').textContent = msg;
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}

function strength(v) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  if (v.length >= 12) s++;
  return s; // 0..5
}

function updateMeter() {
  const s = strength(form.elements.password.value);
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const colors = ['#d93a4f', '#d93a4f', '#e6a23c', '#c9b200', '#1fa97a', '#0f7a56'];
  bar.style.width = (s / 5) * 100 + '%';
  bar.style.background = colors[s];
  strengthText.textContent = form.elements.password.value ? `Strength: ${labels[s]}` : 'Use 8+ characters with upper, lower, number and symbol.';
}

Object.keys(validators).forEach((name) => {
  const input = form.elements[name];
  const wrap = input.closest('.field');
  input.addEventListener('focus', () => wrap.classList.add('focused'));
  input.addEventListener('blur', () => {
    wrap.classList.remove('focused');
    touched.add(name);
    showResult(name);
  });
  // Real-time: validate on input once the field has been touched (or is already invalid)
  input.addEventListener('input', () => {
    if (name === 'password') {
      updateMeter();
      if (touched.has('confirm')) showResult('confirm');
    }
    if (touched.has(name) || wrap.classList.contains('invalid')) showResult(name);
  });
});

// Show/hide password
const showBtn = form.querySelector('.show');
showBtn.addEventListener('click', () => {
  const pw = form.elements.password;
  const hidden = pw.type === 'password';
  pw.type = hidden ? 'text' : 'password';
  showBtn.textContent = hidden ? 'Hide' : 'Show';
  showBtn.setAttribute('aria-pressed', String(hidden));
  showBtn.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  success.hidden = true;
  let firstBad = null;
  Object.keys(validators).forEach((name) => {
    touched.add(name);
    if (!showResult(name) && !firstBad) firstBad = form.elements[name];
  });
  if (firstBad) { firstBad.focus(); return; }
  const btn = form.querySelector('.submit');
  btn.disabled = true;
  btn.textContent = 'Creating account…';
  setTimeout(() => {
    const first = form.elements.name.value.trim().split(/\s+/)[0];
    success.textContent = `🎉 Welcome, ${first}! Your account has been created.`;
    success.hidden = false;
    form.reset();
    touched.clear();
    form.querySelectorAll('.field').forEach((f) => f.classList.remove('valid', 'invalid', 'focused'));
    form.querySelectorAll('.err').forEach((p) => (p.textContent = ''));
    updateMeter();
    btn.disabled = false;
    btn.textContent = 'Sign up';
  }, 700);
});
