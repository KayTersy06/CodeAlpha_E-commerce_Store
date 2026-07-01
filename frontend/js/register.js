document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const message = document.getElementById('registerMessage');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      full_name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      password: document.getElementById('password').value,
    };

    if (payload.password !== document.getElementById('confirmPassword').value) {
      showMessage(message, 'Passwords do not match.', 'error');
      return;
    }

    try {
      await registerUser(payload);
      showMessage(message, 'Account created! You can now log in.', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 800);
    } catch (error) {
      showMessage(message, error.message, 'error');
    }
  });
});
