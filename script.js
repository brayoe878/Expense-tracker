import { formatCurrency, showToast, debounce } from './utils.js';

class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.balance = document.getElementById('balance');
        this.incomeAmount = document.getElementById('income-amount');
        this.expenseAmount = document.getElementById('expense-amount');
        this.transactionList = document.getElementById('transaction-list');
        this.form = document.getElementById('transaction-form');
        this.chart = null;
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.initializeChart();
        this.initializeTouchEvents();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });
    }

    initializeChart() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#2ecc71',
                        '#e74c3c',
                        '#3498db',
                        '#f1c40f',
                        '#9b59b6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    addTransaction() {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const date = document.getElementById('date').value;
        const category = document.getElementById('category').value;

        if (!description || !amount || !date || !category) {
            showToast('Please fill all fields', 'error');
            return;
        }

        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            date,
            category,
            timestamp: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.updateLocalStorage();
        this.updateDisplay();
        this.updateChart();
        this.form.reset();
        
        showToast('Transaction added successfully');
    }

    updateDisplay() {
        this.updateTransactionList();
        this.updateSummary();
    }

    updateTransactionList() {
        const existingTransactions = Array.from(this.transactionList.children);
        
        this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach((transaction, index) => {
                const existingItem = existingTransactions.find(
                    item => item.dataset.id === transaction.id.toString()
                );
                
                if (!existingItem) {
                    const li = document.createElement('li');
                    li.className = `transaction-item ${transaction.type}-item`;
                    li.dataset.id = transaction.id;
                    li.innerHTML = `
                        <div>
                            <strong>${transaction.description}</strong>
                            <small>${transaction.date} | ${transaction.category}</small>
                        </div>
                        <span>${formatCurrency(transaction.amount)}</span>
                        <button class="delete-btn" data-id="${transaction.id}">×</button>
                    `;
                    
                    li.querySelector('.delete-btn').addEventListener('click', () => {
                        this.deleteTransaction(transaction.id);
                    });
                    
                    if (index === 0) {
                        this.transactionList.insertBefore(li, this.transactionList.firstChild);
                    } else {
                        this.transactionList.appendChild(li);
                    }
                }
            });
        
        existingTransactions.forEach(item => {
            if (!this.transactions.find(t => t.id.toString() === item.dataset.id)) {
                item.remove();
            }
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

    updateChart() {
        const categories = {};
        this.transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount;
            }
        });

        this.chart.data.labels = Object.keys(categories);
        this.chart.data.datasets[0].data = Object.values(categories);
        this.chart.update();
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.updateLocalStorage();
        this.updateDisplay();
        this.updateChart();
        showToast('Transaction deleted');
    }

    initializeTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.transactionList.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        this.transactionList.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(e.target.closest('.transaction-item'), touchStartX, touchEndX);
        }, false);
    }

    handleSwipe(element, startX, endX) {
        const swipeThreshold = 100;
        const diff = startX - endX;
        
        if (element && Math.abs(diff) > swipeThreshold) {
            if (diff > 0) { // Swipe left
                const deleteBtn = element.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.click();
                }
            }
        }
    }
}

// Initialize the expense tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ExpenseTracker();
});
