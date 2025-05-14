// Load users and logged-in user data from localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
let allBudgets = JSON.parse(localStorage.getItem("budgets")) || {}; 
let allExpenses = JSON.parse(localStorage.getItem("expenses")) || {}; 

let budgets = currentUser ? allBudgets[currentUser.email] || {} : {};
let expenses = currentUser ? allExpenses[currentUser.email] || {} : {};

// Save updated budgets and expenses back to localStorage
function saveData() {
    allBudgets[currentUser.email] = budgets;
    allExpenses[currentUser.email] = expenses;
    localStorage.setItem("budgets", JSON.stringify(allBudgets));
    localStorage.setItem("expenses", JSON.stringify(allExpenses));
}

// Toggle sections for set budget and record expense
document.getElementById("setBudgetOption")?.addEventListener("click", function () {
    document.getElementById("setBudgetSection").style.display = "block";
    document.getElementById("recordExpenseSection").style.display = "none";
});

document.getElementById("recordExpenseOption")?.addEventListener("click", function () {
    document.getElementById("setBudgetSection").style.display = "none";
    document.getElementById("recordExpenseSection").style.display = "block";
});

// Registration functionality
document.getElementById("registerBtn")?.addEventListener("click", function() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username && email && password) {
        const userExists = users.some(user => user.email === email);
        if (userExists) {
            alert("User already registered. Please log in.");
        } else {
            const newUser = { username, email, password };
            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));
            alert("Registration successful! Please log in.");
            window.location.href = "login.html";
        }
    } else {
        alert("All fields are required!");
    }
});

// Login functionality
document.getElementById("loginBtn")?.addEventListener("click", function () {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (email && password) {
        const user = users.find(user => user.email === email && user.password === password);
        if (user) {
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            window.location.href = "welcome.html";
        } else {
            alert("Invalid credentials. Please try again.");
        }
    } else {
        alert("Please fill both fields.");
    }
});

// Display username on the Welcome page
if (document.getElementById("userName")) {
    currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (currentUser) {
        document.getElementById("userName").textContent = currentUser.username;
    } else {
        window.location.href = "login.html";
    }
}

// Logout function
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// Set Budget functionality
document.getElementById("setBudgetBtn")?.addEventListener("click", function () {
    const category = document.getElementById("category").value.trim();
    const budgetAmount = parseFloat(document.getElementById("budgetAmount").value.trim());
    const timePeriod = parseInt(document.getElementById("timePeriod").value.trim());

    if (category && !isNaN(budgetAmount) && budgetAmount > 0 && !isNaN(timePeriod) && timePeriod > 0) {
        const budgetDetails = {
            amount: budgetAmount,
            timePeriod: timePeriod,
            startDate: new Date().toISOString(),
        };

        budgets[category] = budgetDetails;
        saveData();

        alert(`Budget for ${category} set to ₹${budgetAmount} for ${timePeriod} month(s).`);
        updateSummary();
    } else {
        alert("Please enter valid category, budget amount, and time period.");
    }
});

// Record Expense functionality
document.getElementById("addExpenseBtn")?.addEventListener("click", function () {
    const category = document.getElementById("expenseCategory").value.trim();
    const expenseAmount = parseFloat(document.getElementById("expenseAmount").value.trim());

    if (category && !isNaN(expenseAmount) && expenseAmount > 0) {
        if (budgets[category] !== undefined) {
            // Add the expense to the category
            expenses[category] = expenses[category] || 0;
            expenses[category] += expenseAmount;

            // Save the updated expenses in localStorage
            saveData();

            // Check if the expense exceeds the budget
            if (expenses[category] > budgets[category].amount) {
                alert(`Warning: You have exceeded your budget for ${category}`);
            } else {
                alert(`Expense of ₹${expenseAmount} recorded for ${category}.`);
            }

            // Update the summary table to reflect the changes
            updateSummary();
        } else {
            alert("Please set a budget for this category first.");
        }
    } else {
        alert("Please enter a valid expense amount.");
    }
});

// Update Budget and Expense Summary Table
function updateSummary() {
    const summaryTable = document.getElementById("summaryTable").getElementsByTagName("tbody")[0];
    summaryTable.innerHTML = ''; // Clear any existing rows in the summary table

    let tableUpdated = false;

    for (let category in budgets) {
        const budgetDetails = budgets[category];
        const spent = expenses[category] || 0;
        const remaining = budgetDetails.amount - spent;

        // Add a row for the category
        const row = summaryTable.insertRow();
        row.insertCell(0).textContent = category;
        row.insertCell(1).textContent = `₹${budgetDetails.amount.toFixed(2)}`;
        row.insertCell(2).textContent = `₹${spent.toFixed(2)}`;
        row.insertCell(3).textContent = `₹${remaining.toFixed(2)}`;
        row.insertCell(4).textContent = `${budgetDetails.timePeriod} months`;

        const actionCell = row.insertCell(5);
        const refreshButton = document.createElement("button");
        refreshButton.textContent = "Refresh";
        refreshButton.onclick = function () {
            const startDate = new Date(budgetDetails.startDate);
            const currentDate = new Date();
            const timeDifference = currentDate - startDate;
            const monthsElapsed = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30));

            if (monthsElapsed >= budgetDetails.timePeriod) {
                delete budgets[category];
                saveData();
                alert(`Your budget for ${category} has expired and has been deleted.`);
                updateSummary();
            } else {
                alert("Budget is still active.");
            }
        };

        actionCell.appendChild(refreshButton);

        tableUpdated = true;
    }

    // If no budget is set, show the empty state
    if (!tableUpdated) {
        document.getElementById("emptyState").style.display = "table-row";
    } else {
        document.getElementById("emptyState").style.display = "none";
    }
}

updateSummary();