
// ==========================================
// NAVIGATION
// ==========================================

const navLinks = document.querySelectorAll('.navigation a');
const sections = document.querySelectorAll('.section');

function showSection(id) {

    sections.forEach(function (section) {
        section.classList.remove('active-section');
    });

    const target = document.getElementById(id);

    if (target) {
        target.classList.add('active-section');
    }
}

navLinks.forEach(function (link) {

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

function loadTransactions() {

    try {

        const savedData = localStorage.getItem('transactions');

        const parsedData = savedData ? JSON.parse(savedData) : [];

        return Array.isArray(parsedData) ? parsedData : [];

    } catch (error) {

        console.error('Error loading transactions:', error);

        return [];
    }
}

let transactions = loadTransactions();


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

    return '₹ ' + Math.abs(num).toFixed(2);
}

function formatDate(dateStr) {

    if (!dateStr) {
        return '';
    }

    const parts = dateStr.split('-');

    if (parts.length !== 3) {
        return dateStr;
    }

    return parts[2] + '-' + parts[1] + '-' + parts[0];
}

function saveTransactions() {

    try {

        localStorage.setItem(
            'transactions',
            JSON.stringify(transactions)
        );

    } catch (error) {

        console.error('Error saving transactions:', error);

        alert('Unable to save transactions in browser storage.');
    }
}


// ==========================================
// UPDATE DASHBOARD SUMMARY
// ==========================================

function updateSummary() {

    let income = 0;

    let expense = 0;

    transactions.forEach(function (t) {

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
        t.category.charAt(0).toUpperCase() + t.category.slice(1);


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

    amount.textContent = sign + formatCurrency(Number(t.amount));


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


    // Append all elements

    li.appendChild(dot);

    li.appendChild(info);

    li.appendChild(amount);

    li.appendChild(deleteBtn);

    return li;
}


// ==========================================
// DELETE TRANSACTION
// ==========================================

function deleteTransaction(id) {

    transactions = transactions.filter(function (t) {

        return t.id !== id;
    });

    saveTransactions();

    renderAllTransactions();

    updateSummary();
}


// ==========================================
// DISPLAY ALL TRANSACTIONS
// ==========================================

function renderAllTransactions() {

    if (!transactionList) {
        return;
    }

    transactionList.innerHTML = '';

    // Newest transactions appear first

    transactions
        .slice()
        .reverse()
        .forEach(function (t) {

            transactionList.appendChild(
                renderTransactionItem(t)
            );
        });
}


// ==========================================
// ADD TRANSACTION
// ==========================================

if (transactionForm) {

    transactionForm.addEventListener('submit', function (e) {

        e.preventDefault();

        const amount = parseFloat(amountInput.value);

        const category = categoryInput.value;

        const type = typeInput.value;

        const description = descriptionInput.value.trim();

        const date = dateInput.value;


        // Validation

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


        // Create transaction object

        const newTransaction = {

            id: Date.now(),

            amount: amount,

            category: category,

            type: type,

            description: description,

            date: date
        };


        // Save transaction

        transactions.push(newTransaction);

        saveTransactions();

        renderAllTransactions();

        updateSummary();


        // Reset form

        transactionForm.reset();
    });
}


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

renderAllTransactions();

updateSummary();
