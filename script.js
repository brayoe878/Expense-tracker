class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.balance = document.getElementById('balance');
        this.incomeAmount = document.getElementById('income-amount');
        this.expenseAmount = document.getElementById('expense-amount');
        this.transactionList = document.getElementById('transaction-list');
        this.form = document.getElementById('transaction-form');
        
        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });
    }

    addTransaction() {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;

        const transaction = {
            id: Date.now(),
            description,
            amount,
            type
        };

        this.transactions.push(transaction);
        this.updateLocalStorage();
        this.updateDisplay();
        this.form.reset();
    }

    updateDisplay() {
        this.updateTransactionList();
        this.updateSummary();
    }

    updateTransactionList() {
        this.transactionList.innerHTML = '';
        this.transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.className = `transaction-item ${transaction.type}-item`;
            li.innerHTML = `
                <span>${transaction.description}</span>
                <span>$${Math.abs(transaction.amount).toFixed(2)}</span>
            `;
            this.transactionList.appendChild(li);
        });
    }

    updateSummary() {
        const amounts = this.transactions.map(transaction => 
            transaction.type === 'income' ? transaction.amount : -transaction.amount
        );

        const total = amounts.reduce((acc, item) => acc + item, 0);
        const income = amounts
            .filter(item => item > 0)
            .reduce((acc, item) => acc + item, 0);
        const expense = amounts
            .filter(item => item < 0)
            .reduce((acc, item) => acc + item, 0) * -1;

        this.balance.textContent = `$${total.toFixed(2)}`;
        this.incomeAmount.textContent = `$${income.toFixed(2)}`;
        this.expenseAmount.textContent = `$${expense.toFixed(2)}`;
    }

    updateLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }
}

// Initialize the expense tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ExpenseTracker();
});