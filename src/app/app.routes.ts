import { Routes } from '@angular/router';
import { ExpenseForm } from './components/expense-form/expense-form';
import { BudgetComponent } from './components/budget/budget';
import { ExpenseChart } from './components/expense-chart/expense-chart';
import { SpendingTrend } from './components/spending-trend/spending-trend';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ExpenseForm },
  { path: 'budget', component: BudgetComponent },
  { path: 'charts', component: ExpenseChart },
  { path: 'trends', component: SpendingTrend },
];
