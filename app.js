// Número de WhatsApp (formato internacional sin "+")
const WHATSAPP_NUMBER = "51958799539";

// Estado del carrito
let cart = [];

// 🔢 Parsear precio desde texto "S/ 89.00" o "S/ 89"
function parsePrice(text) {
  if (!text) return null;
  if (text.includes("--") || text.includes("---")) return null;

  const clean = text.replace(",", "."); // por si acaso
  const match = clean.match(/([\d\.]+)/);
  if (!match) return null;

  const value = parseFloat(match[1]);
  if (!isFinite(value) || value === 0) return null;
  return value;
}

// ➕ Agregar producto al carrito
function addToCart(product) {
  const existing = cart.find((item) => item.title === product.title);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  updateCartCount();
}

// 🗑️ Eliminar producto del carrito
function removeFromCart(title) {
  cart = cart.filter((item) => item.title !== title);
  renderCart();
  updateCartCount();
}

// 🔁 Cambiar cantidad
function changeQty(title, delta) {
  const item = cart.find((p) => p.title === title);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(title);
  } else {
    renderCart();
    updateCartCount();
  }
}

// 🧮 Calcular total
function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// 🧾 Renderizar carrito en el panel
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p style='font-size:0.85rem;color:#9ca3af;'>Tu carrito está vacío.</p>";
    if (totalEl) totalEl.textContent = "S/ 0.00";
    return;
  }

  cart.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <div class="cart-item-title">${item.title}</div>
      <div class="cart-item-row">
        <div class="cart-item-qty">
          <button class="cart-qty-btn" data-action="decrement" data-title="${item.title}">-</button>
          <span>${item.qty}</span>
          <button class="cart-qty-btn" data-action="increment" data-title="${item.title}">+</button>
        </div>
        <div>
          <span>S/ ${item.price.toFixed(2)}</span>
        </div>
      </div>
      <div class="cart-item-row">
        <small>Subtotal</small>
        <strong>S/ ${(item.price * item.qty).toFixed(2)}</strong>
      </div>
      <button class="cart-remove" data-action="remove" data-title="${item.title}">
        Quitar
      </button>
    `;
    container.appendChild(div);
  });

  const total = getCartTotal();
  if (totalEl) {
    totalEl.textContent = `S/ ${total.toFixed(2)}`;
  }
}

// 🔢 Actualizar contador del FAB
function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  countEl.textContent = totalItems;
}

// 📲 Enviar carrito completo a WhatsApp
function sendCartToWhatsApp() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const lineas = cart.map((item) => {
    const subtotal = item.price * item.qty;
    return `- ${item.title} x${item.qty} (S/ ${item.price.toFixed(
      2
    )} c/u) = S/ ${subtotal.toFixed(2)}`;
  });

  const total = getCartTotal();

  const mensaje = `
Hola, vi estos productos en el catálogo Lion Shop y quiero más información / comprar:

${lineas.join("\n")}

Total aproximado: S/ ${total.toFixed(2)}

¿Están disponibles? ¿Cuál sería el total con envío?
  `;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    mensaje
  )}`;

  window.open(url, "_blank");
}

// 📲 Enviar solo un producto a WhatsApp
function sendSingleProductToWhatsApp(product) {
  const mensaje = `
Hola, vi este producto en el catálogo Lion Shop y quiero más información / comprarlo:

Producto: ${product.title}
Precio: S/ ${product.price.toFixed(2)}

¿Está disponible? ¿Cuál sería el total con envío?
  `;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    mensaje
  )}`;

  window.open(url, "_blank");
}

// 🎛️ Manejo de apertura/cierre del carrito
function openCart() {
  const overlay = document.getElementById("cart-overlay");
  const panel = document.getElementById("cart-panel");
  if (overlay) overlay.classList.add("show");
  if (panel) panel.classList.add("open");
}

function closeCart() {
  const overlay = document.getElementById("cart-overlay");
  const panel = document.getElementById("cart-panel");
  if (overlay) overlay.classList.remove("show");
  if (panel) panel.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  // 1️⃣ Enlazar FAB y panel del carrito
  const fab = document.getElementById("cart-fab");
  const overlay = document.getElementById("cart-overlay");
  const closeBtn = document.getElementById("cart-close");
  const sendBtn = document.getElementById("cart-send");
  const cartItemsContainer = document.getElementById("cart-items");

  if (fab) fab.addEventListener("click", openCart);
  if (overlay) overlay.addEventListener("click", closeCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (sendBtn) sendBtn.addEventListener("click", sendCartToWhatsApp);

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const action = target.dataset.action;
      const title = target.dataset.title;
      if (!action || !title) return;

      if (action === "increment") {
        changeQty(title, 1);
      } else if (action === "decrement") {
        changeQty(title, -1);
      } else if (action === "remove") {
        removeFromCart(title);
      }
    });
  }

  // 2️⃣ Agregar botones a cada producto
  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card) => {
    const titleEl = card.querySelector(".product-title");
    const priceEl = card.querySelector(".price");
    const tagEl = card.querySelector(".product-tag");

    if (!titleEl || !priceEl) return;

    const title = titleEl.innerText.trim();
    const priceText = priceEl.innerText.trim();
    const priceValue = parsePrice(priceText);

    // Si no hay precio válido, no ponemos botones
    if (priceValue === null) return;

    const category = tagEl ? tagEl.innerText.trim() : "";

    const productData = {
      title,
      price: priceValue,
      category,
    };

    // contenedor de botones
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "product-actions";

    const btnCart = document.createElement("button");
    btnCart.className = "btn-cart";
    btnCart.type = "button";
    btnCart.textContent = "Agregar al carrito";

    btnCart.addEventListener("click", () => {
      addToCart(productData);
    });

    const btnBuy = document.createElement("button");
    btnBuy.className = "btn-buy";
    btnBuy.type = "button";
    btnBuy.textContent = "Comprar por WhatsApp";

    btnBuy.addEventListener("click", () => {
      sendSingleProductToWhatsApp(productData);
    });

    actionsDiv.appendChild(btnCart);
    actionsDiv.appendChild(btnBuy);

    card.appendChild(actionsDiv);
  });

  // 3️⃣ Búsqueda y filtro por categoría (opcional, ya que pusimos IDs)
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");

  function filtrarProductos() {
    const texto = searchInput ? searchInput.value.toLowerCase() : "";
    const categoriaSeleccionada = categoryFilter
      ? categoryFilter.value
      : "todas";

    document.querySelectorAll(".product-card").forEach((card) => {
      const titleEl = card.querySelector(".product-title");
      const descEl = card.querySelector(".product-desc");
      const tagEl = card.querySelector(".product-tag");

      const title = titleEl ? titleEl.innerText.toLowerCase() : "";
      const desc = descEl ? descEl.innerText.toLowerCase() : "";
      const tag = tagEl ? tagEl.innerText : "";

      const coincideTexto =
        !texto || title.includes(texto) || desc.includes(texto);
      const coincideCategoria =
        categoriaSeleccionada === "todas" ||
        (tag && tag.toLowerCase().includes(categoriaSeleccionada.toLowerCase()));

      if (coincideTexto && coincideCategoria) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", filtrarProductos);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filtrarProductos);
  }

  // Inicializar estado visual del carrito
  renderCart();
  updateCartCount();
});


