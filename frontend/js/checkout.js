async function loadCheckoutSummary() {
  const user = getUser();
  const container = document.getElementById('checkoutSummary');
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const items = await apiRequest(`/cart/${user.user_id}`);
    const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    container.innerHTML = `
      <h3>Order Summary</h3>
      ${items.map((item) => `<div class="summary-row"><span>${item.product_name} x ${item.quantity}</span><strong>${formatCurrency(item.price * item.quantity)}</strong></div>`).join('')}
      <div class="summary-row"><span>Total</span><strong>${formatCurrency(total)}</strong></div>
    `;
  } catch (error) {
    container.innerHTML = `<p class="message error">${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCheckoutSummary();
  const form = document.getElementById('checkoutForm');
  const message = document.getElementById('checkoutMessage');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const user = getUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const items = await apiRequest(`/cart/${user.user_id}`);
      if (!items.length) {
        showMessage(message, 'Your cart is empty.', 'error');
        return;
      }
      const payload = {
        user_id: user.user_id,
        delivery_address: document.getElementById('address').value,
        payment_status: 'Pending',
        order_items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity, price: item.price })),
      };
      await apiRequest('/orders', { method: 'POST', body: JSON.stringify(payload) });
      showMessage(message, 'Order placed successfully!', 'success');
      form.reset();
      setTimeout(() => { window.location.href = 'products.html'; }, 800);
    } catch (error) {
      showMessage(message, error.message, 'error');
    }
  });
});
