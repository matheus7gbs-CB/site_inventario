const API_URL = 'http://localhost:3000/api';

// --- Funções de Autenticação ---
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (data.auth) {
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard.html';
        } else {
            alert('Falha no login: usuário ou senha inválidos');
        }
    } catch (err) {
        console.error(err);
        alert('Erro no servidor durante o login.');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            alert('Cadastro realizado com sucesso! Faça login.');
            toggleAuth('login');
        } else {
            alert('Erro ao realizar cadastro. Usuário pode já existir.');
        }
    } catch (err) {
        console.error(err);
        alert('Erro no servidor durante o cadastro.');
    }
}

function toggleAuth(mode) {
    if (mode === 'signup') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
    } else {
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// --- Funções do Dashboard ---
let products = [];

async function fetchProducts() {
    const token = localStorage.getItem('token');
    if (!token) return logout();

    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) return logout();

        products = await response.json();
        renderTable(products);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err);
    }
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.code}</td>
            <td>${product.brand}</td>
            <td>${product.type}</td>
            <td>${product.category}</td>
            <td>R$ ${product.price.toFixed(2)}</td>
            <td>R$ ${product.cost.toFixed(2)}</td>
            <td>${product.notes || ''}</td>
            <td>
                <button onclick="editProduct(${product.id})" class="btn btn-secondary"
                    style="padding: 0.25rem 0.5rem; width: auto;">
                    Editar
                </button>
                <button onclick="deleteProduct(${product.id})" class="btn btn-secondary"
                    style="padding: 0.25rem 0.5rem; width: auto; color: var(--danger); border-color: var(--danger);">
                    Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Filtro e Ordenação
function filterProducts() {
    const categoryTerm = document.getElementById('filterCategory').value.toLowerCase();
    const brandTerm = document.getElementById('filterBrand').value.toLowerCase();

    const filtered = products.filter(p =>
        (p.category || '').toLowerCase().includes(categoryTerm) &&
        (p.brand || '').toLowerCase().includes(brandTerm)
    );

    const sortVal = document.getElementById('sortPrice').value;
    if (sortVal) {
        filtered.sort((a, b) =>
            sortVal === 'asc' ? a.price - b.price : b.price - a.price
        );
    }

    renderTable(filtered);
}

function sortProducts() {
    filterProducts();
}

// --- Produtos ---
function openProductModal(isEdit = false) {
    const modal = document.getElementById('productModal');
    modal.classList.add('active');
    document.getElementById('modalTitle').innerText =
        isEdit ? 'Editar Produto' : 'Adicionar Novo Produto';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    clearForm();
}

function clearForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productForm').reset();
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const token = localStorage.getItem('token');

    const productData = {
        code: document.getElementById('prodCode').value,
        brand: document.getElementById('prodBrand').value,
        type: document.getElementById('prodType').value,
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value),
        cost: parseFloat(document.getElementById('prodCost').value),
        notes: document.getElementById('prodNotes').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            showToast(id ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
            closeProductModal();
            fetchProducts();
        } else {
            alert('Erro ao salvar produto');
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao salvar produto');
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productId').value = product.id;
    document.getElementById('prodCode').value = product.code;
    document.getElementById('prodBrand').value = product.brand;
    document.getElementById('prodType').value = product.type;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodCost').value = product.cost;
    document.getElementById('prodNotes').value = product.notes;

    openProductModal(true);
}

async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('Produto excluído com sucesso');
            fetchProducts();
        }
    } catch (err) {
        console.error(err);
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showSection(sectionId) {
    if (sectionId === 'inventory') {
        // Seção padrão
    }
}
