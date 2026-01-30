import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService, Expense } from '../../services/expense';

@Component({
  selector: 'app-summary-dashboard',
  imports: [CommonModule],
  templateUrl: './summary-dashboard.html',
  styleUrl: './summary-dashboard.css',
})
export class SummaryDashboard implements OnInit {
  totalExpenses = 0;
  monthlyExpenses = 0;
  recentExpenses: Expense[] = [];
  budgetStatus: { category: string; spent: number; budget: number; percentage: number }[] = [];
  categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];
  isLoading = false;
  errorMessage = '';

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.totalExpenses = this.expenseService.getTotalExpenses();
    this.monthlyExpenses = this.getMonthlyExpenses();
    this.recentExpenses = this.getRecentExpenses();
    this.budgetStatus = this.getBudgetStatus();
  }

  getMonthlyExpenses(): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.expenseService.getExpenses()
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  }

  getRecentExpenses(): Expense[] {
    return this.expenseService.getExpenses()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  getBudgetStatus() {
    const expensesByCategory = this.expenseService.getExpensesByCategory();
    const status = [];

    for (const category of this.categories) {
      const spent = expensesByCategory[category] || 0;
      const budget = this.expenseService.getBudgetForCategory(category);
      const limit = budget ? budget.limit : 0;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      status.push({
        category,
        spent,
        budget: limit,
        percentage
      });
    }

    return status;
  }

  getBudgetStatusClass(percentage: number): string {
    if (percentage >= 100) return 'over-budget';
    if (percentage >= 80) return 'warning';
    return 'good';
  }

  exportExpenses(): void {
    this.expenseService.exportToCSV();
  }
}
