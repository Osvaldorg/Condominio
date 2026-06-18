import { create } from "zustand";
import type { BankAccount, ChargeItem, PaymentHistoryComprobante } from "../../../api/types/finances";

interface FinancesState {
  balance: number;
  pendingCharges: ChargeItem[];
  paymentHistory: PaymentHistoryComprobante[];
  bankAccounts: BankAccount[];
  loading: boolean;
  error: string | null;

  setBalanceData: (balance: number) => void;
  setPendingCharges: (charges: ChargeItem[]) => void;
  setPaymentHistory: (history: PaymentHistoryComprobante[]) => void;
  setBankAccounts: (accounts: BankAccount[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFinancesStore = create<FinancesState>((set) => ({
  balance: 0,
  pendingCharges: [],
  paymentHistory: [],
  bankAccounts: [],
  loading: false,
  error: null,

  setBalanceData: (balance) => set({ balance }),
  setPendingCharges: (charges) => set({ pendingCharges: charges }),
  setPaymentHistory: (history) => set({ paymentHistory: history }),
  setBankAccounts: (accounts) => set({ bankAccounts: accounts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
