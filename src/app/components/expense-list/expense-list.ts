import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService, Expense } from '../../services/expense';

@Component({
  selector: 'app-expense-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-list.html',
})
export class ExpenseList implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  searchTerm = '';
  selectedCategory = '';
  categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];
  isLoading = false;
  errorMessage = '';

  constructor(private expenseService: ExpenseService, private router: Router) {}

  ngOnInit() {
    this.expenseService.expenses$.subscribe(expenses => {
      this.expenses = expenses;
      this.filterExpenses();
    });
  }

  onSearchChange() {
    this.filterExpenses();
  }

  onCategoryChange() {
    this.filterExpenses();
  }

  filterExpenses() {
    this.filteredExpenses = this.expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           expense.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || expense.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getTotalAmount(): number {
    return this.filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  }

  viewExpense(expense: Expense) {
    this.router.navigate(['/expense', expense.id]);
  }

  deleteExpense(expense: Expense) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(expense.id).subscribe({
        next: () => {
          // Expense deleted successfully, list will update via observable
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
          alert('Failed to delete expense. Please try again.');
        }
      });
    }
  }

  exportExpenses() {
    this.expenseService.exportToCSV();
  }
}
