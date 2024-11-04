export class SearchTransactions {
    constructor(tracker) {
        this.tracker = tracker;
        this.initializeSearch();
    }

    initializeSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search transactions...';
        searchInput.className = 'search-input';
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.appendChild(searchInput);
        
        const transactionContainer = document.querySelector('.transaction-container');
        transactionContainer.insertBefore(searchContainer, transactionContainer.firstChild);
        
        searchInput.addEventListener('input', debounce((e) => {
            this.searchTransactions(e.target.value);
        }, 300));
    }

    searchTransactions(query) {
        const filteredTransactions = this.tracker.transactions.filter(transaction => {
            const searchString = `${transaction.description} ${transaction.category}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        });

        this.tracker.updateTransactionList(filteredTransactions);
    }
} 