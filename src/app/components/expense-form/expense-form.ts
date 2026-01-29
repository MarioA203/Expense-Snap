import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense';

@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.css',
})
export class ExpenseForm {
  expenseForm: FormGroup;
  categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];

  constructor(private fb: FormBuilder, private expenseService: ExpenseService) {
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      this.expenseService.addExpense(this.expenseForm.value);
      this.expenseForm.reset({
        date: new Date().toISOString().split('T')[0]
      });
      alert('Expense added successfully!');
    }
  }
}
