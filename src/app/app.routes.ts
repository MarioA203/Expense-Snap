import { Routes } from '@angular/router';
import { ExpenseForm } from './components/expense-form/expense-form';
import { BudgetComponent } from './components/budget/budget';
import { ExpenseChart } from './components/expense-chart/expense-chart';
import { SpendingTrend } from './components/spending-trend/spending-trend';
import { ExpenseDetail } from './components/expense-detail/expense-detail';
import { ExpenseList } from './components/expense-list/expense-list';
import { SummaryDashboard } from './components/summary-dashboard/summary-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SummaryDashboard },
  { path: 'add-expense', component: ExpenseForm },
  { path: 'expenses', component: ExpenseList },
  { path: 'budget', component: BudgetComponent },
  { path: 'charts', component: ExpenseChart },
  { path: 'trends', component: SpendingTrend },
  { path: 'expense/:id', component: ExpenseDetail },
];
