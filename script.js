// Form Submission Event Listener
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("contactForm")?.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form submission

        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const message = document.getElementById("message")?.value.trim();
        const feedback = document.getElementById("formFeedback");

        // Check for empty fields
        if (!name || !email || !message) {
            feedback.textContent = "Please fill in all fields.";
            feedback.style.color = "red";
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            feedback.textContent = "Please enter a valid email address.";
            feedback.style.color = "red";
            return;
        }

        // Successful validation
        feedback.textContent = "Form submitted successfully!";
        feedback.style.color = "green";
    });

    // Theme Toggle Button Listener
    document.getElementById("themeToggle")?.addEventListener("click", function () {
        console.log("Toggle button clicked!");
        document.body.classList.toggle("dark-mode");
    });

    // Fetch and Display Products
    fetch("data.xml")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then((xmlString) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");

            const catalog = xmlDoc.getElementsByTagName("catalog")[0];
            const products = Array.from(catalog.getElementsByTagName("product"));

            renderCatalog(products);
        })
        .catch((error) => {
            console.error("Error loading XML:", error);
            document.getElementById("catalog").innerHTML =
                "<p>Error loading catalog data.</p>";
        });

    // Cart Management
    setupCart();
});

let cart = []; // Array to store cart items

// Render Catalog
function renderCatalog(products) {
    const catalogDiv = document.getElementById("catalog");
    let html = `<table border="1">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>`;
    products.forEach((product) => {
        const id = product.getElementsByTagName("id")[0].textContent;
        const name = product.getElementsByTagName("name")[0].textContent;
        const price = parseFloat(
            product.getElementsByTagName("price")[0].textContent
        );
        const description =
            product.getElementsByTagName("description")[0].textContent;

        html += `<tr>
                    <td>${name}</td>
                    <td>$${price.toFixed(2)}</td>
                    <td>${description}</td>
                    <td><button onclick="addToCart('${id}', '${name}', ${price})">Add to Cart</button></td>
                 </tr>`;
    });
    html += `</tbody></table>`;
    catalogDiv.innerHTML = html;
}

// Setup Cart
function setupCart() {
    document.getElementById("sort-asc")?.addEventListener("click", () => {
        sortCatalog("asc");
    });

    document.getElementById("sort-desc")?.addEventListener("click", () => {
        sortCatalog("desc");
    });
}

// Add Item to Cart
function addToCart(id, name, price) {
    const existingItemIndex = cart.findIndex((item) => item.id === id);
    if (existingItemIndex === -1) {
        const item = { id, name, price, quantity: 1 };
        cart.push(item);
    } else {
        cart[existingItemIndex].quantity++;
    }
    updateCart();
}

// Update and Display Cart
function updateCart() {
    const cartList = document.getElementById("cart");
    const cartTotal = document.getElementById("cart-total");
    let total = 0;

    let html = "";
    cart.forEach((item) => {
        html += `<li>
                    ${item.name} - $${item.price.toFixed(2)} x ${item.quantity}
                    <button onclick="removeFromCart('${item.id}')">Remove</button>
                 </li>`;
        total += item.price * item.quantity;
    });

    cartList.innerHTML = html;
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

// Remove Item from Cart
function removeFromCart(id) {
    const existingItemIndex = cart.findIndex((item) => item.id === id);
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity--;
        if (cart[existingItemIndex].quantity <= 0) {
            cart.splice(existingItemIndex, 1);
        }
    }
    updateCart();
}

// Sort Catalog
function sortCatalog(order) {
    fetch("data.xml")
        .then((response) => response.text())
        .then((xmlString) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");

            const catalog = xmlDoc.getElementsByTagName("catalog")[0];
            let products = Array.from(catalog.getElementsByTagName("product"));

            products.sort((a, b) => {
                const priceA = parseFloat(
                    a.getElementsByTagName("price")[0].textContent
                );
                const priceB = parseFloat(
                    b.getElementsByTagName("price")[0].textContent
                );
                return order === "asc" ? priceA - priceB : priceB - priceA;
            });

            renderCatalog(products); // Update rendered catalog
        })
        .catch((error) => console.error("Error sorting catalog:", error));
}