async function loadDashboard() {
  if (!requireAdmin()) return;
  const statsContainer = document.getElementById('dashboardStats');
  if (!statsContainer) return;

  try {
    const [products, categories, orders, users] = await Promise.all([
      apiRequest('/products'),
      apiRequest('/categories'),
      apiRequest('/orders'),
      apiRequest('/users'),
    ]);

    statsContainer.innerHTML = `
      <article class="card"><h3>Total Products</h3><p>${products.length}</p></article>
      <article class="card"><h3>Categories</h3><p>${categories.length}</p></article>
      <article class="card"><h3>Orders</h3><p>${orders.length}</p></article>
      <article class="card"><h3>Customers</h3><p>${users.length}</p></article>
    `;
    if (document.getElementById('adminProducts')) loadAdminProducts();
    if (document.getElementById('adminCategories')) loadAdminCategories();
    if (document.getElementById('adminOrders')) loadAdminOrders();
  } catch (error) {
    statsContainer.innerHTML = `<p class="message error">${error.message}</p>`;
  }
}

async function loadAdminProducts() {
  const container = document.getElementById('adminProducts');
  const form = document.getElementById('productForm');
  if (!container || !form) return;

  try {
    const [products, categories] = await Promise.all([
      apiRequest('/products'),
      apiRequest('/categories'),
    ]);
    populateCategoryOptions(categories);

    container.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
        <tbody>
          ${products.map((product) => `
            <tr>
              <td>${product.product_name}</td>
              <td>${formatCurrency(product.price)}</td>
              <td>${product.stock_quantity}</td>
              <td>
                <button data-edit="${product.product_id}">Edit</button>
                <button data-delete="${product.product_id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => editProduct(button.getAttribute('data-edit'))));
    container.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteProduct(button.getAttribute('data-delete'))));
  } catch (error) {
    container.innerHTML = `<p class="message error">${error.message}</p>`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      category_id: Number(document.getElementById('productCategory').value),
      product_name: document.getElementById('productName').value,
      description: document.getElementById('productDescription').value,
      benefits: document.getElementById('productBenefits').value,
      price: Number(document.getElementById('productPrice').value),
      stock_quantity: Number(document.getElementById('productStock').value),
      image_url: document.getElementById('productImage').value,
      is_active: true,
    };
    const id = document.getElementById('productId').value;
    try {
      if (id) {
        await apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiRequest('/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      form.reset();
      loadAdminProducts();
    } catch (error) {
      alert(error.message);
    }
  });
}

function populateCategoryOptions(categories) {
  const categorySelect = document.getElementById('productCategory');
  if (!categorySelect) return;
  categorySelect.innerHTML = '<option value="">Select category</option>' + categories.map((category) => `
    <option value="${category.category_id}">${category.category_name}</option>
  `).join('');
}

async function editProduct(id) {
  const product = await apiRequest(`/products/${id}`);
  const categorySelect = document.getElementById('productCategory');
  document.getElementById('productId').value = product.product_id;
  document.getElementById('productName').value = product.product_name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock_quantity;
  document.getElementById('productImage').value = product.image_url || '';
  if (categorySelect) categorySelect.value = product.category_id || '';
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productBenefits').value = product.benefits || '';
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
    loadAdminProducts();
  } catch (error) {
    alert(error.message);
  }
}

async function loadAdminCategories() {
  const container = document.getElementById('adminCategories');
  const form = document.getElementById('categoryForm');
  if (!container || !form) return;

  try {
    const categories = await apiRequest('/categories');
    container.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Actions</th></tr></thead>
        <tbody>
          ${categories.map((category) => `
            <tr>
              <td>${category.category_name}</td>
              <td>
                <button data-edit="${category.category_id}">Edit</button>
                <button data-delete="${category.category_id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => editCategory(button.getAttribute('data-edit'))));
    container.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteCategory(button.getAttribute('data-delete'))));
  } catch (error) {
    container.innerHTML = `<p class="message error">${error.message}</p>`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = { category_name: document.getElementById('categoryName').value };
    const id = document.getElementById('categoryId').value;
    try {
      if (id) {
        await apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiRequest('/categories', { method: 'POST', body: JSON.stringify(payload) });
      }
      form.reset();
      loadAdminCategories();
    } catch (error) {
      alert(error.message);
    }
  });
}

async function editCategory(id) {
  const category = await apiRequest(`/categories/${id}`);
  document.getElementById('categoryId').value = category.category_id;
  document.getElementById('categoryName').value = category.category_name;
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  try {
    await apiRequest(`/categories/${id}`, { method: 'DELETE' });
    loadAdminCategories();
  } catch (error) {
    alert(error.message);
  }
}

async function loadAdminOrders() {
  const container = document.getElementById('adminOrders');
  if (!container) return;
  try {
    const orders = await apiRequest('/orders');
    container.innerHTML = `
      <table>
        <thead><tr><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
        <tbody>
          ${orders.map((order) => `
            <tr>
              <td>${order.full_name}</td>
              <td>${new Date(order.order_date).toLocaleDateString()}</td>
              <td>${formatCurrency(order.total_amount)}</td>
              <td>${order.order_status || 'Pending'}</td>
              <td>${order.payment_status || 'Pending'}</td>
              <td>
                <button data-update="${order.order_id}">Update</button>
                <button data-delete="${order.order_id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.querySelectorAll('[data-update]').forEach((button) => button.addEventListener('click', () => updateOrder(button.getAttribute('data-update'))));
    container.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteOrder(button.getAttribute('data-delete'))));
  } catch (error) {
    container.innerHTML = `<p class="message error">${error.message}</p>`;
  }
}

async function updateOrder(id) {
  const status = prompt('Update order status', 'Delivered');
  if (!status) return;
  try {
    await apiRequest(`/orders/${id}`, { method: 'PUT', body: JSON.stringify({ order_status: status, payment_status: 'Paid' }) });
    loadAdminOrders();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  try {
    await apiRequest(`/orders/${id}`, { method: 'DELETE' });
    loadAdminOrders();
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
