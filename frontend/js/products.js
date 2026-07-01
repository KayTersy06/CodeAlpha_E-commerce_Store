const productState = { products: [], categories: [] };

function buildProductCard(product) {
  const image = product.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80';
  return `
    <article class="card product-card">
      <img src="${image}" alt="${product.product_name}" />
      <div>
        <h3>${product.product_name}</h3>
        <p class="muted">${product.description || 'Premium wellness product'}</p>
        <div class="price">${formatCurrency(product.price)}</div>
      </div>
      <div class="controls">
        <a href="product-details.html?id=${product.product_id}" class="btn btn-secondary">View Details</a>
        <button class="btn btn-primary" data-add="${product.product_id}">Add to Cart</button>
      </div>
    </article>
  `;
}

async function loadHomeContent() {
  const featuredContainer = document.getElementById('featuredProducts');
  const categoriesContainer = document.getElementById('homeCategories');
  if (!featuredContainer && !categoriesContainer) return;

  try {
    const [products, categories] = await Promise.all([
      apiRequest('/products'),
      apiRequest('/categories'),
    ]);

    productState.products = products;
    productState.categories = categories;

    if (featuredContainer) {
      featuredContainer.innerHTML = products.slice(0, 3).map(buildProductCard).join('');
    }
    if (categoriesContainer) {
      categoriesContainer.innerHTML = categories.slice(0, 6).map((category) => `
        <article class="card">
          <h3>${category.category_name}</h3>
          <p>Explore products tailored for ${category.category_name.toLowerCase()}.</p>
          <a href="categories.html" class="btn btn-secondary">Browse</a>
        </article>
      `).join('');
    }
  } catch (error) {
    if (featuredContainer) featuredContainer.innerHTML = '<p class="message error">Unable to load products right now.</p>';
    if (categoriesContainer) categoriesContainer.innerHTML = '<p class="message error">Unable to load categories right now.</p>';
  }
}

async function loadProductsPage() {
  const productsGrid = document.getElementById('productsGrid');
  const loader = document.getElementById('productsLoader');
  const categoryFilter = document.getElementById('categoryFilter');
  const searchInput = document.getElementById('searchInput');
  const sortFilter = document.getElementById('sortFilter');
  if (!productsGrid) return;

  try {
    const [products, categories] = await Promise.all([
      apiRequest('/products'),
      apiRequest('/categories'),
    ]);
    productState.products = products;
    productState.categories = categories;

    categoryFilter.innerHTML = '<option value="">All categories</option>' + categories.map((category) => `<option value="${category.category_id}">${category.category_name}</option>`).join('');

    renderProducts();

    [categoryFilter, searchInput, sortFilter].forEach((element) => {
      if (element) {
        element.addEventListener('input', renderProducts);
        element.addEventListener('change', renderProducts);
      }
    });
  } catch (error) {
    if (loader) loader.textContent = error.message;
    productsGrid.innerHTML = '<p class="message error">Unable to load products right now.</p>';
  }
}

function renderProducts() {
  const productsGrid = document.getElementById('productsGrid');
  const loader = document.getElementById('productsLoader');
  const categoryFilter = document.getElementById('categoryFilter');
  const searchInput = document.getElementById('searchInput');
  const sortFilter = document.getElementById('sortFilter');
  if (!productsGrid) return;

  let filtered = [...productState.products];
  const category = categoryFilter?.value || '';
  const search = searchInput?.value.toLowerCase() || '';
  if (category) filtered = filtered.filter((product) => String(product.category_id) === category);
  if (search) filtered = filtered.filter((product) => product.product_name.toLowerCase().includes(search));

  if (sortFilter?.value === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sortFilter?.value === 'price-desc') filtered.sort((a, b) => b.price - a.price);

  if (loader) loader.style.display = 'none';
  if (!filtered.length) {
    productsGrid.innerHTML = '<p class="message">No products match your filters.</p>';
    return;
  }

  productsGrid.innerHTML = filtered.map(buildProductCard).join('');
  productsGrid.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.getAttribute('data-add')));
  });
}

async function loadProductDetails() {
  const detailContainer = document.getElementById('productDetail');
  if (!detailContainer) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    detailContainer.innerHTML = '<p class="message error">No product selected.</p>';
    return;
  }

  try {
    const product = await apiRequest(`/products/${id}`);
    detailContainer.innerHTML = `
      <div class="detail-card">
        <img src="${product.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80'}" alt="${product.product_name}" />
        <div>
          <p class="eyebrow">${product.product_name}</p>
          <h1>${product.product_name}</h1>
          <p>${product.description || 'Premium wellness product'}</p>
          <h3>Benefits</h3>
          <p>${product.benefits || 'Supports a healthy lifestyle.'}</p>
          <div class="price">${formatCurrency(product.price)}</div>
          <div class="controls">
            <input type="number" id="quantity" min="1" value="1" style="width: 80px; padding: .7rem; border-radius: 10px; border: 1px solid #e5e7eb;" />
            <button class="btn btn-primary" id="addDetail">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('addDetail').addEventListener('click', () => {
      const quantity = Number(document.getElementById('quantity').value || 1);
      addToCart(product.product_id, quantity);
    });
  } catch (error) {
    detailContainer.innerHTML = `<p class="message error">${error.message}</p>`;
  }
}

async function addToCart(productId, quantity = 1) {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  try {
    await apiRequest(`/cart/${user.user_id}`, {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    window.location.href = 'cart.html';
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('featuredProducts') || document.getElementById('homeCategories')) {
    loadHomeContent();
  }
  if (document.getElementById('productsGrid')) {
    loadProductsPage();
  }
  if (document.getElementById('productDetail')) {
    loadProductDetails();
  }
});
