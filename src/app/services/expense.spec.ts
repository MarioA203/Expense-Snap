import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExpenseService, Expense, Budget } from './expense';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExpenseService]
    });
    service = TestBed.inject(ExpenseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load expenses on initialization', () => {
    const mockExpenses: Expense[] = [
      { id: '1', amount: 50, category: 'Food', date: '2023-01-01', description: 'Lunch' }
    ];

    service.expenses$.subscribe(expenses => {
      expect(expenses).toEqual(mockExpenses);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/expenses');
    expect(req.request.method).toBe('GET');
    req.flush(mockExpenses);
  });

  it('should add an expense', () => {
    const newExpense: Omit<Expense, 'id'> = {
      amount: 25,
      category: 'Transportation',
      date: '2023-01-02',
      description: 'Bus ticket'
    };

    service.addExpense(newExpense).subscribe(expense => {
      expect(expense.amount).toBe(25);
      expect(expense.category).toBe('Transportation');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/expenses');
    expect(req.request.method).toBe('POST');
    req.flush({ ...newExpense, id: 'generated-id' });
  });

  it('should calculate total expenses', () => {
    const mockExpenses: Expense[] = [
      { id: '1', amount: 50, category: 'Food', date: '2023-01-01', description: 'Lunch' },
      { id: '2', amount: 30, category: 'Transportation', date: '2023-01-02', description: 'Bus' }
    ];

    service.expenses$.next(mockExpenses);
    expect(service.getTotalExpenses()).toBe(80);
  });

  it('should get expenses by category', () => {
    const mockExpenses: Expense[] = [
      { id: '1', amount: 50, category: 'Food', date: '2023-01-01', description: 'Lunch' },
      { id: '2', amount: 30, category: 'Food', date: '2023-01-02', description: 'Dinner' },
      { id: '3', amount: 20, category: 'Transportation', date: '2023-01-03', description: 'Bus' }
    ];

    service.expenses$.next(mockExpenses);
    const expensesByCategory = service.getExpensesByCategory();
    expect(expensesByCategory['Food']).toBe(80);
    expect(expensesByCategory['Transportation']).toBe(20);
  });

  it('should export to CSV', () => {
    const mockExpenses: Expense[] = [
      { id: '1', amount: 50, category: 'Food', date: '2023-01-01', description: 'Lunch' }
    ];

    service.expenses$.next(mockExpenses);

    spyOn(document, 'createElement').and.callThrough();
    spyOn(document.body, 'appendChild').and.callThrough();
    spyOn(document.body, 'removeChild').and.callThrough();

    service.exportToCSV();

    expect(document.createElement).toHaveBeenCalledWith('a');
  });
});
