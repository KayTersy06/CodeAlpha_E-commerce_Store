let cartItems = [];

async function loadCart() {
  const user = getUser();
  const cartItemsContainer = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');
  const cartMessage = document.getElementById('cartMessage');
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    cartItems = await apiRequest(`/cart/${user.user_id}`);
    if (!cartItems.length) {
      cartItemsContainer.innerHTML = '<p class="message">Your cart is empty. Start shopping to add wellness essentials.</p>';
      cartSummary.innerHTML = '';
      return;
    }

    cartItemsContainer.innerHTML = cartItems.map((item) => `
      <div class="cart-item">
        <div>
          <h3>${item.product_name}</h3>
          <p class="muted">${formatCurrency(item.price)} each</p>
        </div>
        <div class="controls">
          <button data-action="decrease" data-id="${item.cart_item_id}">−</button>
          <span>${item.quantity}</span>
          <button data-action="increase" data-id="${item.cart_item_id}">+</button>
          <button data-action="remove" data-id="${item.cart_item_id}">Remove</button>
        </div>
      </div>
    `).join('');

    const total = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    cartSummary.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(total)}</strong></div>
      <a href="checkout.html" class="btn btn-primary">Checkout</a>
      <a href="products.html" class="btn btn-secondary">Continue Shopping</a>
    `;

    cartItemsContainer.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => handleCartAction(button.getAttribute('data-action'), button.getAttribute('data-id')));
    });
  } catch (error) {
    cartMessage.innerHTML = `<p class="message error">${error.message}</p>`;
  }
}

async function handleCartAction(action, id) {
  try {
    if (action === 'remove') {
      await apiRequest(`/cart/${id}`, { method: 'DELETE' });
    } else {
      const item = cartItems.find((entry) => String(entry.cart_item_id) === String(id));
      if (!item) return;
      const quantity = action === 'increase' ? Number(item.quantity) + 1 : Math.max(1, Number(item.quantity) - 1);
      await apiRequest(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
    }
    loadCart();
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', loadCart);
