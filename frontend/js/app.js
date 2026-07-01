const API_BASE = 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('coachTersyToken');
}

function getUser() {
  const user = localStorage.getItem('coachTersyUser');
  return user ? JSON.parse(user) : null;
}

function setAuth(user, token) {
  localStorage.setItem('coachTersyToken', token);
  localStorage.setItem('coachTersyUser', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('coachTersyToken');
  localStorage.removeItem('coachTersyUser');
}

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function showMessage(element, message, type = 'success') {
  if (!element) return;
  element.className = `message ${type}`;
  element.textContent = message;
}

function handleLogout(event, redirectTo = 'login.html') {
  event.preventDefault();
  clearAuth();
  window.location.href = redirectTo;
}

function setupNav() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const authLink = document.getElementById('authLink');
  if (authLink) {
    const user = getUser();
    authLink.textContent = user ? `Hi, ${user.full_name || 'User'}` : 'Login';
    authLink.href = user ? 'cart.html' : 'login.html';
  }

  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const existingLogout = navLinks.querySelector('#logoutLink');
    if (existingLogout) {
      existingLogout.remove();
    }

    const hasAdminLogout = Boolean(navLinks.querySelector('#logoutAdmin'));
    if (getUser() && !hasAdminLogout) {
      const logoutLink = document.createElement('a');
      logoutLink.id = 'logoutLink';
      logoutLink.href = '#';
      logoutLink.textContent = 'Logout';
      logoutLink.addEventListener('click', (event) => handleLogout(event, 'login.html'));
      navLinks.appendChild(logoutLink);
    }
  }
}

function isAdmin() {
  const user = getUser();
  return user?.role === 'admin';
}

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  const adminLinks = document.querySelectorAll('[id="logoutAdmin"]');
  adminLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      handleLogout(event, '../login.html');
    });
  });
});
