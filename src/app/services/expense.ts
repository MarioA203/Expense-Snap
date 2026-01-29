import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface Budget {
  category: string;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly EXPENSES_KEY = 'expenses';
  private readonly BUDGETS_KEY = 'budgets';

  private expensesSubject = new BehaviorSubject<Expense[]>(this.loadExpensesFromStorage());
  private budgetsSubject = new BehaviorSubject<Budget[]>(this.loadBudgetsFromStorage());

  public expenses$ = this.expensesSubject.asObservable();
  public budgets$ = this.budgetsSubject.asObservable();

  constructor() {}

  private loadExpensesFromStorage(): Expense[] {
    const expenses = localStorage.getItem(this.EXPENSES_KEY);
    return expenses ? JSON.parse(expenses) : [];
  }

  private loadBudgetsFromStorage(): Budget[] {
    const budgets = localStorage.getItem(this.BUDGETS_KEY);
    return budgets ? JSON.parse(budgets) : [];
  }

  private saveExpensesToStorage(expenses: Expense[]): void {
    localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(expenses));
    this.expensesSubject.next(expenses);
  }

  private saveBudgetsToStorage(budgets: Budget[]): void {
    localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(budgets));
    this.budgetsSubject.next(budgets);
  }

  // Expense methods
  getExpenses(): Expense[] {
    return this.expensesSubject.value;
  }

  addExpense(expense: Omit<Expense, 'id'>): void {
    const expenses = [...this.getExpenses()];
    const newExpense: Expense = {
      ...expense,
      id: this.generateId()
    };
    expenses.push(newExpense);
    this.saveExpensesToStorage(expenses);
  }

  updateExpense(id: string, updatedExpense: Partial<Expense>): void {
    const expenses = [...this.getExpenses()];
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updatedExpense };
      this.saveExpensesToStorage(expenses);
    }
  }

  deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    this.saveExpensesToStorage(expenses);
  }

  // Budget methods
  getBudgets(): Budget[] {
    return this.budgetsSubject.value;
  }

  setBudget(budget: Budget): void {
    const budgets = [...this.getBudgets()];
    const existingIndex = budgets.findIndex(b => b.category === budget.category);
    if (existingIndex !== -1) {
      budgets[existingIndex] = budget;
    } else {
      budgets.push(budget);
    }
    this.saveBudgetsToStorage(budgets);
  }

  getBudgetForCategory(category: string): Budget | undefined {
    const budgets = this.getBudgets();
    return budgets.find(b => b.category === category);
  }

  // Analytics methods
  getTotalExpenses(): number {
    return this.getExpenses().reduce((total, expense) => total + expense.amount, 0);
  }

  getExpensesByCategory(): { [category: string]: number } {
    const expenses = this.getExpenses();
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [category: string]: number });
  }

  getExpensesOverTime(): { date: string; amount: number }[] {
    const expenses = this.getExpenses();
    const grouped = expenses.reduce((acc, expense) => {
      const date = expense.date;
      acc[date] = (acc[date] || 0) + expense.amount;
      return acc;
    }, {} as { [date: string]: number });

    return Object.keys(grouped).map(date => ({ date, amount: grouped[date] })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Trend prediction using linear regression
  predictSpending(days: number = 5): number[] {
    const expensesOverTime = this.getExpensesOverTime();
    if (expensesOverTime.length < 2) return [];

    const n = expensesOverTime.length;
    const sumX = expensesOverTime.reduce((sum, _, i) => sum + i, 0);
    const sumY = expensesOverTime.reduce((sum, point) => sum + point.amount, 0);
    const sumXY = expensesOverTime.reduce((sum, point, i) => sum + i * point.amount, 0);
    const sumXX = expensesOverTime.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictions: number[] = [];
    for (let i = 1; i <= days; i++) {
      predictions.push(slope * (n + i - 1) + intercept);
    }
    return predictions;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
