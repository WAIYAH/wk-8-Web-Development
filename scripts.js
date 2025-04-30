document.addEventListener('DOMContentLoaded', () => {
    // Cart Functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    // Update cart count in the header
    function updateCartCount() {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('#cartCount').forEach(el => {
            el.textContent = cartCount;
        });
    }

    // Add to Cart
    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${product.name} added to cart!`);
    };

    // Product Data
    const products = [
        { id: 1, name: 'Fresh Tomatoes', price: 2.99, category: 'vegetables', image: 'img/tomatoes.jpeg' },
        { id: 2, name: 'Organic Apples', price: 3.49, category: 'fruits', image: 'img/apples.jpeg' },
        { id: 3, name: 'Green Broccoli', price: 1.99, category: 'vegetables', image: 'img/broccoli.jpeg' },
        { id: 4, name: 'Bananas', price: 1.29, category: 'fruits', image: 'img/banana.jpeg' },
        { id: 5, name: 'Carrots', price: 0.99, category: 'vegetables', image: 'img/carrot.png' },
        { id: 6, name: 'Strawberries', price: 4.99, category: 'fruits', image: 'img/strawberry.jpeg' },
        { id: 7, name: 'Potatoes', price: 1.49, category: 'vegetables', image: 'img/potatoes.jpeg' },
        { id: 8, name: 'Grapes', price: 2.99, category: 'fruits', image: 'img/grapes.jpeg' },
    ];

    // Display Featured Products on Index Page
    const featuredProducts = document.getElementById('featuredProducts');
    if (featuredProducts) {
        products.forEach(product => {
            const productCard = `
                <div class="col-md-3 mb-4">
                    <div class="card product-card">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">$${product.price.toFixed(2)}</p>
                            <button class="btn btn-warning" onclick="addToCart(${product.id})">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
            featuredProducts.innerHTML += productCard;
        });
    }

    // Display Products on Shop Page
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        renderProducts(products);
    }

    // Render Products
    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';
        productsToRender.forEach(product => {
            const productCard = `
                <div class="col-md-3 mb-4">
                    <div class="card product-card">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">$${product.price.toFixed(2)}</p>
                            <button class="btn btn-warning" onclick="addToCart(${product.id})">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
            productGrid.innerHTML += productCard;
        });
    }

    // Filter Products by Category
    window.filterProducts = function() {
        const category = document.getElementById('categoryFilter').value;
        let filteredProducts = products;
        if (category !== 'all') {
            filteredProducts = products.filter(p => p.category === category);
        }
        renderProducts(filteredProducts);
        sortProducts(); // Reapply sorting after filtering
    };

    // Sort Products by Price
    window.sortProducts = function() {
        const sortOption = document.getElementById('priceSort').value;
        let sortedProducts = [...document.getElementById('productGrid').children].map(child => {
            const name = child.querySelector('.card-title').textContent;
            const product = products.find(p => p.name === name);
            return product;
        });

        if (sortOption === 'low-to-high') {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'high-to-low') {
            sortedProducts.sort((a, b) => b.price - a.price);
        }
        renderProducts(sortedProducts);
    };

    // Newsletter Subscription
    window.subscribeNewsletter = function() {
        const email = document.getElementById('newsletterEmail').value;
        const messageDiv = document.getElementById('newsletterMessage');
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            messageDiv.innerHTML = '<p class="text-danger">Please enter a valid email address.</p>';
            return;
        }
        messageDiv.innerHTML = '<p class="text-success">Thank you for subscribing!</p>';
        document.getElementById('newsletterEmail').value = '';
    };

    // Contact Form Submission
    window.submitContactForm = function() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        const messageDiv = document.getElementById('contactMessage');

        if (!name || !email || !subject || !message) {
            messageDiv.innerHTML = '<p class="text-danger">Please fill out all fields.</p>';
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            messageDiv.innerHTML = '<p class="text-danger">Please enter a valid email address.</p>';
            return;
        }

        messageDiv.innerHTML = '<p class="text-success">Message sent successfully!</p>';
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('message').value = '';
    };
});