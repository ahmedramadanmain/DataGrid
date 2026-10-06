# React Interview Task – Reusable Data Grid

## Objective

Build a reusable **Data Grid** component that displays user data from the JSONPlaceholder API.

### API

Use the following endpoint:

https://jsonplaceholder.typicode.com/users

## Features

### 1. Fetch Data

Display the following user information:

- ID
- Name
- Username
- Email
- Phone
- Website
- Company
- City

---

### 2. Loading & Error States

Handle the following states:

- Loading (Skeleton or Spinner)
- Error
- Empty Data

---

### 3. Global Search

Implement a global search that filters users by:

- Name
- Username
- Email
- Phone
- Website

---

### 4. Column Filters

Add filters for each applicable column.
Can user select the search rule like: equal, notEqual, ...etc (optional).
Suggested filter types:

| Column | Filter Type |
|---------|-------------|
| Name | Text |
| Username | Text |
| Email | Text |
| Company | Select |
| City | Select |
| Website | Text |

Multiple filters should work together.

---

### 5. Pagination

Implement client-side pagination.
Can using the search params to preserve the paignation (optional).
Allow users to change the page size:

- 10
- 25
- 50
- 100


### 7. Row Selection

Support:

- Single row selection
- Multiple row selection
- Select All

### 10. Performance

Optimize the application using:

- React.memo
- useMemo
- useCallback
- Debounced search
- Avoid unnecessary re-renders

## Evaluation Criteria

- React architecture
- Component reusability
- TypeScript usage
- Code quality
- Performance optimization
- Responsive design
- Clean folder structure

---

## Deliverables

- Git repository
- Well-structured and clean code
- Meaningful commit history (optional)

---

## Notes

- Do **not** modify the API data.
- Focus on clean architecture and reusable components.
- You may use any state management solution if needed.
- Third-party libraries are allowed when they provide clear value.