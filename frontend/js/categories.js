async function loadCategoriesPage() {
  const categoriesGrid = document.getElementById('categoriesGrid');
  const productsGrid = document.getElementById('categoryProducts');
  const loader = document.getElementById('categoriesLoader');
  if (!categoriesGrid) return;

  try {
    const categories = await apiRequest('/categories');
    categoriesGrid.innerHTML = categories.map((category) => `
      <article class="card">
        <h3>${category.category_name}</h3>
        <p>Browse products in this category.</p>
        <button class="btn btn-primary" data-category="${category.category_id}">Load Products</button>
      </article>
    `).join('');

    categoriesGrid.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => loadCategoryProducts(button.getAttribute('data-category')));
    });
  } catch (error) {
    loader.textContent = error.message;
    categoriesGrid.innerHTML = '<p class="message error">Unable to load categories.</p>';
  }
}

async function loadCategoryProducts(categoryId) {
  const productsGrid = document.getElementById('categoryProducts');
  if (!productsGrid) return;
  try {
    const products = await apiRequest(`/products?category=${categoryId}`);
    productsGrid.innerHTML = products.length ? products.map((product) => `
      <article class="card product-card">
        <h3>${product.product_name}</h3>
        <p>${product.description || ''}</p>
        <div class="price">${formatCurrency(product.price)}</div>
        <a href="product-details.html?id=${product.product_id}" class="btn btn-secondary">View Details</a>
      </article>
    `).join('') : '<p class="message">No products in this category yet.</p>';
  } catch (error) {
    productsGrid.innerHTML = `<p class="message error">${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadCategoriesPage);
