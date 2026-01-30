import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService, Budget } from '../../services/expense';

@Component({
  selector: 'app-budget',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class BudgetComponent implements OnInit {
  budgetForm: FormGroup;
  budgets: Budget[] = [];
  categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];
  expensesByCategory: { [category: string]: number } = {};

  constructor(private fb: FormBuilder, private expenseService: ExpenseService) {
    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      limit: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    this.loadBudgets();
    this.loadExpensesByCategory();
  }

  loadBudgets() {
    this.budgets = this.expenseService.getBudgets();
  }

  loadExpensesByCategory() {
    this.expensesByCategory = this.expenseService.getExpensesByCategory();
  }

  onSubmit() {
    if (this.budgetForm.valid) {
      this.expenseService.setBudget(this.budgetForm.value).subscribe({
        next: () => {
          this.loadBudgets();
          this.budgetForm.reset();
          alert('Budget set successfully!');
        },
        error: (error) => {
          console.error('Error setting budget:', error);
          alert('Failed to set budget. Please try again.');
        }
      });
    }
  }

  getBudgetStatus(category: string): { spent: number; limit: number; percentage: number; overBudget: boolean } {
    const spent = this.expensesByCategory[category] || 0;
    const budget = this.budgets.find(b => b.category === category);
    const limit = budget ? budget.limit : 0;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    return { spent, limit, percentage, overBudget: spent > limit };
  }
}
