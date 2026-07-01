async function loginUser(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function registerUser(payload) {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function requireAuth(redirectTo = 'login.html') {
  const user = getUser();
  if (!user) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = '../login.html';
    return false;
  }
  return true;
}
