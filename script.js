// ===== SECTION NAVIGATION =====
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

// Navigation links
navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = link.getAttribute('href').replace('#', '');

        showSection(targetId);
    });
});

// "Start Tracking" button on home -> go to dashboard
const homeBtn = document.getElementById('home-btn');

if (homeBtn) {
    homeBtn.addEventListener('click', function () {
        showSection('dashboard');
    });
}

// Show home by default on load
showSection('home');


// ===== TRANSACTION LOGIC =====

// Get transactions from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Form and input elements
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');

const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');


// ===== FORMAT CURRENCY =====
function formatCurrency(num) {
    return '₹ ' + Math.abs(num).toFixed(2);
}


// ===== FORMAT DATE =====
function formatDate(dateStr) {
    if (!dateStr) {
        return '';
    }

    const parts = dateStr.split('-');

    // yyyy-mm-dd -> dd-mm-yyyy
    if (parts.length !== 3) {
        return dateStr;
    }

    return parts[2] + '-' + parts[1] + '-' + parts[0];
}


// ===== SAVE TRANSACTIONS =====
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}


// ===== UPDATE SUMMARY =====
function updateSummary() {
    let income = 0;
    let expense = 0;

    transactions.forEach(function (t) {
        if (t.type === 'income') {
            income += t.amount;
        } else {
            expense += t.amount;
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


// ===== RENDER ONE TRANSACTION =====
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

    li.innerHTML =
        '<span class="dot ' + dotClass + '"></span>' +

        '<div class="transaction-info">' +

            '<p class="transaction-name">' +
                categoryLabel +
                (t.description ? ' - ' + t.description : '') +
            '</p>' +

            '<p class="transaction-date">' +
                formatDate(t.date) +
            '</p>' +

        '</div>' +

        '<span class="transaction-amount ' +
            amountClass +
        '">' +
            sign +
            formatCurrency(t.amount) +
        '</span>' +

        '<button class="delete-btn" title="Delete transaction">&times;</button>';

    const deleteBtn = li.querySelector('.delete-btn');

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
            deleteTransaction(t.id);
        });
    }

    if (transactionList) {
        transactionList.prepend(li);
    }
}


// ===== DELETE TRANSACTION =====
function deleteTransaction(id) {
    transactions = transactions.filter(function (t) {
        return t.id !== id;
    });

    saveTransactions();

    renderAllTransactions();

    updateSummary();
}


// ===== RENDER ALL TRANSACTIONS =====
function renderAllTransactions() {

    if (!transactionList) {
        return;
    }

    transactionList.innerHTML = '';

    // Show most recent transactions first
    transactions
        .slice()
        .reverse()
        .forEach(function (t) {
            renderTransactionItem(t);
        });
}


// ===== ADD TRANSACTION =====
if (transactionForm) {

    transactionForm.addEventListener('submit', function (e) {

        e.preventDefault();

        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const type = typeInput.value;
        const description = descriptionInput.value.trim();
        const date = dateInput.value;


        // Validate input
        if (
            !amount ||
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


        // Create new transaction
        const newTransaction = {

            id: Date.now(),

            amount: amount,

            category: category,

            type: type,

            description: description,

            date: date
        };


        // Add transaction to array
        transactions.push(newTransaction);


        // Save to localStorage
        saveTransactions();


        // Display transaction
        renderTransactionItem(newTransaction);


        // Update balance, income and expense
        updateSummary();


        // Clear form
        transactionForm.reset();
    });
}


// ===== INITIAL PAGE LOAD =====

// Display saved transactions
renderAllTransactions();

// Update balance, income and expense
updateSummary();