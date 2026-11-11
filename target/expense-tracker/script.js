
// ==========================================
// NAVIGATION
// ==========================================

const navLinks = document.querySelectorAll('.navigation a');
const sections = document.querySelectorAll('.section');

function showSection(id) {
    sections.forEach(section => {
        section.classList.remove('active-section');
    });

    const target = document.getElementById(id);

    if (target) {
        target.classList.add('active-section');
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = link.getAttribute('href').replace('#', '');
        showSection(targetId);
    });
});

const homeBtn = document.getElementById('home-btn');

if (homeBtn) {
    homeBtn.addEventListener('click', function () {
        showSection('dashboard');
    });
}

showSection('home');


// ==========================================
// TRANSACTION DATA
// ==========================================

let transactions = [];

const API_URL = 'transactions';


// ==========================================
// DOM ELEMENTS
// ==========================================

const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');

const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');


// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatCurrency(num) {
    return '₹ ' + Math.abs(Number(num)).toFixed(2);
}

function formatDate(dateStr) {
    if (!dateStr) return '';

    const parts = dateStr.split('-');

    if (parts.length !== 3) return dateStr;

    return parts[2] + '-' + parts[1] + '-' + parts[0];
}


// ==========================================
// UPDATE DASHBOARD SUMMARY
// ==========================================

function updateSummary() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            income += Number(t.amount);
        } else {
            expense += Number(t.amount);
        }
    });

    const balance = income - expense;

    const balanceElement =
        document.querySelector('.balance-card .card-text p');

    const incomeElement =
        document.querySelector('.income-card .card-text p');

    const expenseElement =
        document.querySelector('.expense-card .card-text p');

    if (balanceElement) {
        balanceElement.textContent = formatCurrency(balance);
    }

    if (incomeElement) {
        incomeElement.textContent = formatCurrency(income);
    }

    if (expenseElement) {
        expenseElement.textContent = formatCurrency(expense);
    }
}


// ==========================================
// CREATE TRANSACTION ITEM
// ==========================================

function renderTransactionItem(t) {
    const li = document.createElement('li');
    li.className = 'transaction-item';

    const dotClass =
        t.type === 'income' ? 'income-dot' : 'expense-dot';

    const amountClass =
        t.type === 'income' ? 'income-amount' : 'expense-amount';

    const sign =
        t.type === 'income' ? '+ ' : '- ';

    const categoryLabel =
        String(t.category || '').charAt(0).toUpperCase() +
        String(t.category || '').slice(1);

    // Transaction dot
    const dot = document.createElement('span');
    dot.className = 'dot ' + dotClass;

    // Transaction information
    const info = document.createElement('div');
    info.className = 'transaction-info';

    const name = document.createElement('p');
    name.className = 'transaction-name';

    name.textContent =
        categoryLabel +
        (t.description ? ' - ' + t.description : '');

    const date = document.createElement('p');
    date.className = 'transaction-date';
    date.textContent = formatDate(t.date);

    info.appendChild(name);
    info.appendChild(date);

    // Transaction amount
    const amount = document.createElement('span');
    amount.className = 'transaction-amount ' + amountClass;
    amount.textContent = sign + formatCurrency(t.amount);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'Delete transaction';

    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'images/delete.png';
    deleteIcon.alt = 'delete';

    deleteBtn.appendChild(deleteIcon);

    deleteBtn.addEventListener('click', function () {
        deleteTransaction(t.id);
    });

    li.appendChild(dot);
    li.appendChild(info);
    li.appendChild(amount);
    li.appendChild(deleteBtn);

    return li;
}


// ==========================================
// DISPLAY ALL TRANSACTIONS
// ==========================================

function renderAllTransactions() {
    if (!transactionList) return;

    transactionList.innerHTML = '';

    transactions.forEach(t => {
        transactionList.appendChild(
            renderTransactionItem(t)
        );
    });
}


// ==========================================
// LOAD TRANSACTIONS FROM MYSQL
// ==========================================

async function loadTransactions() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to load transactions.');
        }

        transactions = await response.json();

        renderAllTransactions();
        updateSummary();

    } catch (error) {
        console.error('Loading error:', error);
        alert('Unable to load transactions from the database.');
    }
}


// ==========================================
// ADD TRANSACTION TO MYSQL
// ==========================================

if (transactionForm) {
    transactionForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const type = typeInput.value;
        const description = descriptionInput.value.trim();
        const date = dateInput.value;

        if (
            !Number.isFinite(amount) ||
            amount <= 0 ||
            !category ||
            !type ||
            !date
        ) {
            alert(
                'Please fill in Amount, Category, Type, and Date.'
            );
            return;
        }

        const formData = new URLSearchParams();

        formData.append('action', 'add');
        formData.append('amount', amount);
        formData.append('category', category);
        formData.append('type', type);
        formData.append('description', description);
        formData.append('date', date);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            transactionForm.reset();

            await loadTransactions();

            alert('Transaction added successfully!');

        } catch (error) {
            console.error('Add transaction error:', error);
            alert('Unable to add transaction. ' + error.message);
        }
    });
}


// ==========================================
// DELETE TRANSACTION FROM MYSQL
// ==========================================

async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    const formData = new URLSearchParams();

    formData.append('action', 'delete');
    formData.append('transactionId', id);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        await loadTransactions();

        alert('Transaction deleted successfully!');

    } catch (error) {
        console.error('Delete transaction error:', error);
        alert('Unable to delete transaction. ' + error.message);
    }
}




// ==========================================
// USER SESSION, WELCOME MESSAGE AND LOGOUT
// ==========================================

async function checkLoginSession() {
    try {
        const response = await fetch('auth', {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (response.status === 401) {
            window.location.replace('login.html');
            return false;
        }

        if (!response.ok) {
            throw new Error('Unable to verify login session.');
        }

        const user = await response.json();
        const welcomeElement = document.getElementById('welcome-user');

        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${user.userName}! 😊`;
        }

        return true;
    } catch (error) {
        console.error('Session check error:', error);
        alert('Unable to verify your login. Please log in again.');
        window.location.replace('login.html');
        return false;
    }
}

const logoutButton = document.getElementById('logout-btn');

if (logoutButton) {
    logoutButton.addEventListener('click', async function () {
        if (!confirm('Are you sure you want to log out?')) return;

        const formData = new URLSearchParams();
        formData.append('action', 'logout');

        try {
            const response = await fetch('auth', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (!response.ok) throw new Error('Logout failed.');
            window.location.replace('login.html');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Unable to log out. Please try again.');
        }
    });
}

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

(async function initializeApplication() {
    const loggedIn = await checkLoginSession();
    if (loggedIn) {
        await loadTransactions();
    }
})();
