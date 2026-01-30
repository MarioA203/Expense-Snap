import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExpenseService, Expense } from '../../services/expense';

@Component({
  selector: 'app-expense-detail',
  imports: [CommonModule],
  templateUrl: './expense-detail.html',
  styleUrl: './expense-detail.css',
})
export class ExpenseDetail implements OnInit {
  expense: Expense | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExpense(id);
    }
  }

  loadExpense(id: string) {
    const expenses = this.expenseService.getExpenses();
    this.expense = expenses.find(e => e.id === id) || null;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  editExpense() {
    if (this.expense) {
      this.router.navigate(['/expense', this.expense.id, 'edit']);
    }
  }

  deleteExpense() {
    if (this.expense && confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(this.expense.id).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    }
  }
}
