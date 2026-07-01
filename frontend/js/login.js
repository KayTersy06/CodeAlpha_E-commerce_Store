document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const message = document.getElementById('loginMessage');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const data = await loginUser(email, password);
      setAuth(data.user, data.token);
      showMessage(message, 'Login successful!', 'success');
      setTimeout(() => {
        window.location.href = data.user.role === 'admin' ? 'admin/dashboard.html' : 'index.html';
      }, 800);
    } catch (error) {
      showMessage(message, error.message, 'error');
    }
  });
});
