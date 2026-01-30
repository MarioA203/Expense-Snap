# TODO: Advanced Features Implementation

## Backend Changes
- [x] Add sqlite3 dependency to backend/package.json
- [x] Update server.js to use SQLite database for expenses and budgets persistence

## Frontend Export Functionality
- [x] Add export button to expense-list.html
- [x] Add export method to expense-list.ts calling ExpenseService.exportToCSV()

## Dark Mode Toggle
- [x] Create navigation.html with menu and dark mode toggle
- [x] Update navigation.ts to handle dark mode toggle and menu state
- [x] Add dark mode CSS variables and styles to styles.css

## Error Handling and Loading States
- [x] Add loading states and error handling to expense-list.ts
- [x] Add loading states and error handling to summary-dashboard.ts
- [x] Update corresponding HTML templates for loading spinners and error messages

## Unit Tests
- [x] Create expense.spec.ts for ExpenseService unit tests
- [x] Create summary-dashboard.spec.ts for SummaryDashboard component tests

## Followup Steps
- [ ] Install backend dependencies (npm install in backend)
- [ ] Test app functionality
- [ ] Run unit tests (ng test)
