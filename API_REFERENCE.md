# API Reference Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require authentication via JWT token.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid input

---

### Login User
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Invalid credentials

---

## 📦 Inventory Endpoints

### Create Product
```
POST /inventory/products
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Laptop",
  "sku": "LAPTOP-001",
  "description": "Dell XPS 13 Laptop",
  "quantity": 50,
  "unit_cost": 600,
  "selling_price": 900,
  "category": "Electronics",
  "reorder_level": 10
}
```

**Response:**
```json
{
  "id": "prod-123"
}
```

**Status Codes:**
- `200`: Created
- `401`: Unauthorized
- `500`: Server error

---

### Get All Products
```
GET /inventory/products
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "prod-123",
    "name": "Laptop",
    "sku": "LAPTOP-001",
    "quantity": 50,
    "unit_cost": 600,
    "selling_price": 900,
    "category": "Electronics",
    "reorder_level": 10,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized

---

### Update Product Quantity
```
PATCH /inventory/products/:id
```

**Path Parameters:**
- `id`: Product ID

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 45
}
```

**Response:**
```json
{
  "success": true
}
```

---

### Get Low Stock Products
```
GET /inventory/low-stock
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "prod-456",
    "name": "Mouse",
    "sku": "MOUSE-001",
    "quantity": 5,
    "reorder_level": 10
  }
]
```

---

## 👥 Customer Endpoints

### Create Customer
```
POST /customers
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "ABC Store",
  "email": "contact@abcstore.com",
  "phone": "555-1234",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "credit_limit": 10000
}
```

**Response:**
```json
{
  "id": "cust-123"
}
```

---

### Get All Customers
```
GET /customers
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "cust-123",
    "name": "ABC Store",
    "email": "contact@abcstore.com",
    "phone": "555-1234",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "credit_limit": 10000,
    "total_debt": 2500,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Get Customer Debts
```
GET /customers/:id/debts
```

**Path Parameters:**
- `id`: Customer ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "debt-123",
    "customer_id": "cust-123",
    "sale_id": "sale-456",
    "amount": 1500,
    "paid_amount": 500,
    "remaining_amount": 1000,
    "status": "pending",
    "due_date": "2024-02-15T00:00:00Z"
  }
]
```

---

### Record Payment
```
POST /customers/:id/payments
```

**Path Parameters:**
- `id`: Customer ID

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "debt_id": "debt-123",
  "amount": 500,
  "payment_method": "cash"
}
```

**Payment Methods:**
- `cash`
- `check`
- `bank_transfer`
- `card`

**Response:**
```json
{
  "success": true
}
```

---

## 💳 Sales Endpoints

### Create Sale
```
POST /sales
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer_id": "cust-123",
  "items": [
    {
      "product_id": "prod-123",
      "quantity": 2,
      "unit_price": 100
    },
    {
      "product_id": "prod-456",
      "quantity": 1,
      "unit_price": 50
    }
  ],
  "notes": "Bulk order"
}
```

**Response:**
```json
{
  "id": "sale-123",
  "totalAmount": 250
}
```

---

### Get All Sales
```
GET /sales
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "sale-123",
    "customer_id": "cust-123",
    "customer_name": "ABC Store",
    "sale_date": "2024-01-15T10:30:00Z",
    "total_amount": 250,
    "payment_status": "pending",
    "notes": "Bulk order"
  }
]
```

---

### Get Sale by ID
```
GET /sales/:id
```

**Path Parameters:**
- `id`: Sale ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "sale-123",
  "customer_id": "cust-123",
  "sale_date": "2024-01-15T10:30:00Z",
  "total_amount": 250,
  "payment_status": "pending",
  "items": [
    {
      "id": "item-123",
      "product_id": "prod-123",
      "quantity": 2,
      "unit_price": 100,
      "total": 200
    }
  ]
}
```

---

## 💸 Expense Endpoints

### Create Expense Category
```
POST /expenses/categories
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Office Supplies",
  "description": "Office supplies and stationery"
}
```

**Response:**
```json
{
  "id": "cat-123"
}
```

---

### Get Expense Categories
```
GET /expenses/categories
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "cat-123",
    "name": "Office Supplies",
    "description": "Office supplies and stationery",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Create Expense
```
POST /expenses
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category": "Office Supplies",
  "description": "Printer ink cartridges",
  "amount": 75.50,
  "payment_method": "card",
  "status": "paid",
  "notes": "For office printer"
}
```

**Status Values:**
- `paid`
- `pending`

**Response:**
```json
{
  "id": "exp-123"
}
```

---

### Get All Expenses
```
GET /expenses
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "exp-123",
    "category": "Office Supplies",
    "description": "Printer ink cartridges",
    "amount": 75.50,
    "expense_date": "2024-01-15T10:30:00Z",
    "payment_method": "card",
    "status": "paid",
    "notes": "For office printer"
  }
]
```

---

### Get Expenses by Date Range
```
GET /expenses/range/:startDate/:endDate
```

**Path Parameters:**
- `startDate`: Start date (YYYY-MM-DD format)
- `endDate`: End date (YYYY-MM-DD format)

**Headers:**
```
Authorization: Bearer <token>
```

**Example:**
```
GET /expenses/range/2024-01-01/2024-01-31
```

**Response:** Array of expenses within the date range

---

## 📊 Dashboard Endpoints

### Get Dashboard Statistics
```
GET /dashboard/stats
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalSales": 50000,
  "totalExpenses": 15000,
  "totalDebts": 8000,
  "customerCount": 45,
  "productCount": 120,
  "lowStockCount": 5
}
```

---

### Get Sales Trend (Last 30 Days)
```
GET /dashboard/sales-trend
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "amount": 1200
  },
  {
    "date": "2024-01-02",
    "amount": 1500
  }
]
```

---

### Get Expense Breakdown
```
GET /dashboard/expense-breakdown
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "category": "Office Supplies",
    "total": 500,
    "count": 5
  },
  {
    "category": "Utilities",
    "total": 1200,
    "count": 3
  }
]
```

---

### Get Top Customers
```
GET /dashboard/top-customers
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "cust-123",
    "name": "ABC Store",
    "purchase_count": 15,
    "total_spent": 25000
  }
]
```

---

## 🔄 Common Error Responses

### Unauthorized (401)
```json
{
  "error": "Invalid token"
}
```

### Not Found (404)
```json
{
  "error": "Resource not found"
}
```

### Bad Request (400)
```json
{
  "error": "Invalid input"
}
```

### Server Error (500)
```json
{
  "error": "Something went wrong!"
}
```

---

## 📝 Request Examples

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"John"}'
```

**Create Product:**
```bash
curl -X POST http://localhost:5000/api/inventory/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","sku":"LP001","quantity":10,"unit_cost":600,"selling_price":900}'
```

### Using JavaScript/Fetch

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/inventory/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Laptop',
    sku: 'LP001',
    quantity: 10,
    unit_cost: 600,
    selling_price: 900
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 🔐 Authentication Flow

1. **Register** - Create new account
2. **Login** - Get JWT token
3. **Store Token** - Save to localStorage or sessionStorage
4. **Include Token** - Add to Authorization header for all requests
5. **Refresh** - If token expires, login again

---

## 📞 Support

For API issues or questions, please create an issue on GitHub.
