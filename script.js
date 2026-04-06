/* -----------------------------
  DOM references
------------------------------ */
const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const clearSelectionsBtn = document.getElementById("clearSelections");
const generateRoutineBtn = document.getElementById("generateRoutine");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const rtlToggle = document.getElementById("rtlToggle");

/* -----------------------------
  App state
------------------------------ */
const STORAGE_KEY = "lorealSelectedProducts";
const WORKER_URL = "";

let allProducts = [];
let selectedIds = new Set();
let expandedDescriptionIds = new Set();
let routineWasGenerated = false;
let isRequestInFlight = false;

/* Keep full conversation history for context-aware follow-up answers */
let messages = [
  {
    role: "system",
    content:
      "You are a helpful L'Oreal routine advisor. Keep responses focused on the user's selected routine, skincare, haircare, makeup, fragrance, and related beauty topics. Be clear and practical.",
  },
];

/* -----------------------------
  Storage helpers
------------------------------ */
function saveSelectedProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedIds]));
}

function loadSelectedProducts() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    selectedIds = new Set(parsed);
  } catch (error) {
    console.error("Could not load saved products:", error);
    selectedIds = new Set();
  }
}

/* -----------------------------
  Data loading
------------------------------ */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  allProducts = data.products;
}

/* -----------------------------
  Rendering helpers
------------------------------ */
function renderPlaceholder(message) {
  productsContainer.innerHTML = `<div class="placeholder-message">${message}</div>`;
}

function getFilteredProducts() {
  const selectedCategory = categoryFilter.value;
  const searchQuery = productSearch.value.trim().toLowerCase();

  return allProducts.filter((product) => {
    const categoryMatch =
      selectedCategory === "all" || product.category === selectedCategory;

    const searchableText =
      `${product.name} ${product.brand} ${product.description}`.toLowerCase();
    const searchMatch =
      searchQuery === "" || searchableText.includes(searchQuery);

    return categoryMatch && searchMatch;
  });
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();

  if (filteredProducts.length === 0) {
    renderPlaceholder("No products match this filter.");
    return;
  }

  productsContainer.innerHTML = filteredProducts
    .map((product) => {
      const isSelected = selectedIds.has(product.id);
      const descriptionExpanded = expandedDescriptionIds.has(product.id);

      return `
        <article
          class="product-card ${isSelected ? "selected" : ""}"
          data-id="${product.id}"
          role="button"
          tabindex="0"
          aria-pressed="${isSelected}"
        >
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-info">
            <h3>${product.name}</h3>
            <p class="brand">${product.brand}</p>
            <button class="description-btn" type="button" data-action="toggle-description">
              ${descriptionExpanded ? "Hide Description" : "Show Description"}
            </button>
            <p class="product-description" ${descriptionExpanded ? "" : "hidden"}>${product.description}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSelectedProducts() {
  const selectedProducts = allProducts.filter((product) =>
    selectedIds.has(product.id),
  );

  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML =
      "<p class='selected-empty'>No products selected yet.</p>";
    return;
  }

  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
        <div class="selected-chip">
          <span>${product.brand}: ${product.name}</span>
          <button type="button" data-remove-id="${product.id}" aria-label="Remove ${product.name}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `,
    )
    .join("");
}

function appendMessage(role, text) {
  const messageEl = document.createElement("div");
  messageEl.className = `chat-message ${role}`;
  messageEl.textContent = text;
  chatWindow.appendChild(messageEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* -----------------------------
  Selection helpers
------------------------------ */
function toggleProductSelection(productId) {
  if (selectedIds.has(productId)) {
    selectedIds.delete(productId);
  } else {
    selectedIds.add(productId);
  }

  saveSelectedProducts();
  renderProducts();
  renderSelectedProducts();
}

function clearAllSelections() {
  selectedIds = new Set();
  saveSelectedProducts();
  renderProducts();
  renderSelectedProducts();
}

function setLoadingState(isLoading) {
  isRequestInFlight = isLoading;
  generateRoutineBtn.disabled = isLoading;
  userInput.disabled = isLoading;
}

/* -----------------------------
  API helpers
------------------------------ */
async function requestChatCompletion(updatedMessages) {
  if (!WORKER_URL) {
    throw new Error(
      "Worker URL is missing. Add your Cloudflare Worker URL in script.js.",
    );
  }

  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: updatedMessages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Worker error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const aiText = data.choices?.[0]?.message?.content;

  if (!aiText) {
    throw new Error("No response text found in API response.");
  }

  return aiText;
}

async function generateRoutine() {
  if (isRequestInFlight) {
    return;
  }

  const selectedProducts = allProducts.filter((product) =>
    selectedIds.has(product.id),
  );

  if (selectedProducts.length === 0) {
    appendMessage(
      "assistant",
      "Please select at least one product before generating a routine.",
    );
    return;
  }

  appendMessage("assistant", "Building your personalized routine...");
  setLoadingState(true);

  const routinePrompt = `Create a simple morning and evening beauty routine using only these selected products. Mention why each product fits.\n\nSelected products JSON:\n${JSON.stringify(
    selectedProducts,
    null,
    2,
  )}`;

  const updatedMessages = [
    ...messages,
    { role: "user", content: routinePrompt },
  ];

  try {
    const routineText = await requestChatCompletion(updatedMessages);
    messages = [
      ...updatedMessages,
      { role: "assistant", content: routineText },
    ];
    routineWasGenerated = true;
    appendMessage("assistant", routineText);
  } catch (error) {
    appendMessage("assistant", `Could not generate routine: ${error.message}`);
  } finally {
    setLoadingState(false);
  }
}

async function handleFollowUpQuestion(question) {
  if (isRequestInFlight) {
    return;
  }

  if (!routineWasGenerated) {
    appendMessage(
      "assistant",
      "Generate a routine first, then ask follow-up questions.",
    );
    return;
  }

  appendMessage("user", question);
  setLoadingState(true);

  const updatedMessages = [...messages, { role: "user", content: question }];

  try {
    const answer = await requestChatCompletion(updatedMessages);
    messages = [...updatedMessages, { role: "assistant", content: answer }];
    appendMessage("assistant", answer);
  } catch (error) {
    appendMessage(
      "assistant",
      `I could not answer that right now: ${error.message}`,
    );
  } finally {
    setLoadingState(false);
  }
}

/* -----------------------------
  Event listeners
------------------------------ */
categoryFilter.addEventListener("change", renderProducts);
productSearch.addEventListener("input", renderProducts);

productsContainer.addEventListener("click", (event) => {
  const descriptionButton = event.target.closest(
    '[data-action="toggle-description"]',
  );

  if (descriptionButton) {
    const productCard = descriptionButton.closest(".product-card");
    const description = productCard.querySelector(".product-description");
    const isHidden = description.hasAttribute("hidden");
    const id = Number(productCard.dataset.id);

    if (isHidden) {
      description.removeAttribute("hidden");
      descriptionButton.textContent = "Hide Description";
      expandedDescriptionIds.add(id);
    } else {
      description.setAttribute("hidden", "");
      descriptionButton.textContent = "Show Description";
      expandedDescriptionIds.delete(id);
    }

    return;
  }

  const card = event.target.closest(".product-card");

  if (!card) {
    return;
  }

  const id = Number(card.dataset.id);
  toggleProductSelection(id);
});

productsContainer.addEventListener("keydown", (event) => {
  const card = event.target.closest(".product-card");

  if (!card) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  const id = Number(card.dataset.id);
  toggleProductSelection(id);
});

selectedProductsList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("button[data-remove-id]");

  if (!removeButton) {
    return;
  }

  const id = Number(removeButton.dataset.removeId);
  selectedIds.delete(id);
  saveSelectedProducts();
  renderProducts();
  renderSelectedProducts();
});

clearSelectionsBtn.addEventListener("click", clearAllSelections);
generateRoutineBtn.addEventListener("click", generateRoutine);

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = userInput.value.trim();

  if (!question) {
    return;
  }

  userInput.value = "";
  await handleFollowUpQuestion(question);
});

rtlToggle.addEventListener("change", (event) => {
  document.documentElement.dir = event.target.checked ? "rtl" : "ltr";
});

/* -----------------------------
  Initial app setup
------------------------------ */
async function init() {
  try {
    await loadProducts();
    loadSelectedProducts();
    renderProducts();
    renderSelectedProducts();

    appendMessage(
      "assistant",
      "Select products, click Generate Routine, then ask follow-up questions about your routine.",
    );
  } catch (error) {
    console.error(error);
    renderPlaceholder("Could not load products. Please refresh and try again.");
  }
}

init();
