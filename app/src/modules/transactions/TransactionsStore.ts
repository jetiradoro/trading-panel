import { defineStore } from 'pinia';
import { api } from 'boot/axios';

interface Transaction {
  id: string;
  accountId: string;
  origin: string;
  amount: number;
  date: string;
  description?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  balance: number;
}
export const useTransactionsStore = defineStore('transactions', {
  state: (): TransactionsState => ({
    transactions: [],
    balance: 0,
  }),

  actions: {
    async fetchTransactions() {
      const { data } = await api.get('/transactions');
      this.transactions = data;
      this.balance = this.transactions.reduce((acc, transaction) => {
        return acc + transaction.amount;
      }, 0);
    },

    async deleteTransaction(transaction_id: string) {
      try {
        return api.delete(`/transactions/${transaction_id}`);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    },
  },

  getters: {
    getBalance: (state): number => {
      return state.balance;
    },
    getGroupedByMonth: (state) => {
      const result = {} as any;
      let open: boolean = true;
      state.transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
        const year = date.getFullYear();
        const groupKey = `${month}-${year}`;
        const groupLabel = `${month} ${year}`;

        if (!result[groupKey]) {
          result[groupKey] = {
            open,
            month: groupLabel,
            balance: 0,
            transactions: [],
          };
        }
        result[groupKey].transactions.push(transaction);
        result[groupKey].balance += transaction.amount;
        open = false;
      });
      return result;
    },
  },
});
