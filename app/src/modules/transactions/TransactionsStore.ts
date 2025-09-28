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
  },

  getters: {
    getBalance: (state): number => {
      return state.balance;
    },
  },
});
