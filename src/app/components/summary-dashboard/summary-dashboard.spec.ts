import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryDashboard } from './summary-dashboard';
import { ExpenseService } from '../../services/expense';
import { of } from 'rxjs';

describe('SummaryDashboard', () => {
  let component: SummaryDashboard;
  let fixture: ComponentFixture<SummaryDashboard>;
  let mockExpenseService: jasmine.SpyObj<ExpenseService>;

  beforeEach(async () => {
    const expenseServiceSpy = jasmine.createSpyObj('ExpenseService', [
      'getTotalExpenses',
      'getExpenses',
      'getExpensesByCategory',
      'getBudgetForCategory'
    ]);

    await TestBed.configureTestingModule({
      imports: [SummaryDashboard],
      providers: [
        { provide: ExpenseService, useValue: expenseServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryDashboard);
    component = fixture.componentInstance;
    mockExpenseService = TestBed.inject(ExpenseService) as jasmine.SpyObj<ExpenseService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    const mockExpenses = [
      { id: '1', amount: 50, category: 'Food', date: '2023-01-01', description: 'Lunch' },
      { id: '2', amount: 30, category: 'Transportation', date: '2023-01-01', description: 'Bus' }
    ];

    mockExpenseService.getExpenses.and.returnValue(mockExpenses);
    mockExpenseService.getTotalExpenses.and.returnValue(80);
    mockExpenseService.getExpensesByCategory.and.returnValue({ 'Food': 50, 'Transportation': 30 });
    mockExpenseService.getBudgetForCategory.and.returnValue({ category: 'Food', limit: 100 });

    component.ngOnInit();

    expect(component.totalExpenses).toBe(80);
    expect(component.monthlyExpenses).toBe(80); // Assuming current month
    expect(component.recentExpenses.length).toBe(2);
    expect(component.budgetStatus.length).toBe(6); // Number of categories
  });

  it('should get budget status class correctly', () => {
    expect(component.getBudgetStatusClass(50)).toBe('good');
    expect(component.getBudgetStatusClass(85)).toBe('warning');
    expect(component.getBudgetStatusClass(105)).toBe('over-budget');
  });

  it('should call exportExpenses on export', () => {
    spyOn(mockExpenseService, 'exportToCSV');

    component.exportExpenses();

    expect(mockExpenseService.exportToCSV).toHaveBeenCalled();
  });
});
