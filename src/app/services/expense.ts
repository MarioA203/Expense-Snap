import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

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
  private readonly API_URL = 'http://localhost:3001/api';

  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);

  public expenses$ = this.expensesSubject.asObservable();
  public budgets$ = this.budgetsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadExpenses();
    this.loadBudgets();
  }

  private loadExpenses(): void {
    this.http.get<Expense[]>(`${this.API_URL}/expenses`).subscribe({
      next: expenses => this.expensesSubject.next(expenses),
      error: error => {
        console.error('Error loading expenses:', error);
        this.expensesSubject.next([]);
      }
    });
  }

  private loadBudgets(): void {
    this.http.get<Budget[]>(`${this.API_URL}/budgets`).subscribe({
      next: budgets => this.budgetsSubject.next(budgets),
      error: error => {
        console.error('Error loading budgets:', error);
        this.budgetsSubject.next([]);
      }
    });
  }

  // Expense methods
  getExpenses(): Expense[] {
    return this.expensesSubject.value;
  }

  addExpense(expense: Omit<Expense, 'id'>): Observable<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: this.generateId()
    };
    return this.http.post<Expense>(`${this.API_URL}/expenses`, newExpense).pipe(
      tap(() => this.loadExpenses())
    );
  }

  updateExpense(id: string, updatedExpense: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${this.API_URL}/expenses/${id}`, updatedExpense).pipe(
      tap(() => this.loadExpenses())
    );
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/expenses/${id}`).pipe(
      tap(() => this.loadExpenses())
    );
  }

  // Budget methods
  getBudgets(): Budget[] {
    return this.budgetsSubject.value;
  }

  setBudget(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(`${this.API_URL}/budgets`, budget).pipe(
      tap(() => this.loadBudgets())
    );
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

  exportToCSV(): void {
    const expenses = this.getExpenses();
    if (expenses.length === 0) {
      alert('No expenses to export.');
      return;
    }

    const headers = ['ID', 'Amount', 'Category', 'Date', 'Description'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        expense.id,
        expense.amount,
        expense.category,
        expense.date,
        `"${expense.description.replace(/"/g, '""')}"` // Escape quotes
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
