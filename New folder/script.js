let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

const form = document.getElementById("expenseForm");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

const expenseList = document.getElementById("expenseList");
const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");

const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");


// Add expense
form.addEventListener("submit", function(event) {

    event.preventDefault();

    const expense = {
        id: Date.now(),
        amount: Number(amountInput.value),
        category: categoryInput.value,
        date: dateInput.value,
        description: descriptionInput.value
    };

    expenses.push(expense);

    saveExpenses();
    displayExpenses();

    form.reset();
});


// Save expenses in browser
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}


// Display expenses
function displayExpenses() {

    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;

    const filteredExpenses = expenses.filter(function(expense) {

        const matchesSearch =
            expense.description.toLowerCase().includes(searchText) ||
            expense.category.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            expense.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    expenseList.innerHTML = "";

    if (filteredExpenses.length === 0) {
        expenseList.innerHTML =
            '<div class="empty">No expenses found.</div>';
    }

    filteredExpenses.forEach(function(expense) {

        const item = document.createElement("div");
        item.className = "expense-item";

        item.innerHTML = `
            <div class="expense-info">
                <h3>${expense.description}</h3>
                <p>${expense.category} • ${expense.date}</p>
            </div>

            <div class="expense-right">
                <div class="amount">₹${expense.amount}</div>

                <button class="edit-btn"
                    onclick="editExpense(${expense.id})">
                    Edit
                </button>

                <button class="delete-btn"
                    onclick="deleteExpense(${expense.id})">
                    Delete
                </button>
            </div>
        `;

        expenseList.appendChild(item);
    });

    updateSummary();
    updateCategorySummary();
}


// Delete expense
function deleteExpense(id) {

    if (confirm("Delete this expense?")) {

        expenses = expenses.filter(function(expense) {
            return expense.id !== id;
        });

        saveExpenses();
        displayExpenses();
    }
}


// Edit expense
function editExpense(id) {

    const expense = expenses.find(function(item) {
        return item.id === id;
    });

    if (!expense) return;

    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;
    descriptionInput.value = expense.description;

    expenses = expenses.filter(function(item) {
        return item.id !== id;
    });

    saveExpenses();
    displayExpenses();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function updateSummary() {

    const total = expenses.reduce(function(sum, expense) {
        return sum + expense.amount;
    }, 0);

    totalAmount.textContent = "₹" + total;
    expenseCount.textContent = expenses.length;

    const budget = Number(localStorage.getItem("monthlyBudget")) || 0;
    const remaining = budget - total;

    document.getElementById("remainingBudget").textContent =
        "₹" + remaining;
}


// Category summary
function updateCategorySummary() {

    const categories = {};

    expenses.forEach(function(expense) {

        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }

        categories[expense.category] += expense.amount;
    });

    const summary = document.getElementById("categorySummary");

    summary.innerHTML = "";

    if (Object.keys(categories).length === 0) {
        summary.innerHTML = "<p>No expenses yet.</p>";
        return;
    }

    for (const category in categories) {

        summary.innerHTML += `
            <div class="summary-row">
                <span>${category}</span>
                <strong>₹${categories[category]}</strong>
            </div>
        `;
    }
}


// Search and filter
searchInput.addEventListener("input", displayExpenses);
filterCategory.addEventListener("change", displayExpenses);


// Initial display
displayExpenses();
// Set monthly budget
function setBudget() {

    const budgetInput = document.getElementById("budgetInput");
    const budget = Number(budgetInput.value);

    if (budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    localStorage.setItem("monthlyBudget", budget);

    budgetInput.value = "";

    document.getElementById("budgetMessage").textContent =
        "Monthly budget set to ₹" + budget;

    updateSummary();
}