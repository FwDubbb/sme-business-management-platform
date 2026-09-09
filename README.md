# SME Business Management Platform

A comprehensive web application designed to centralize all business operations for Small and Medium Enterprises (SMEs). Instead of managing sales notebooks, inventory spreadsheets, customer debts in separate books, and expenses mentally or on paper, this platform combines everything in one unified system.

## 🎯 Features

### 📊 Dashboard
- **Real-time Statistics**: Total sales, expenses, outstanding debts at a glance
- **Visual Analytics**: 
  - Sales trend charts (last 30 days)
  - Expense breakdown by category
  - Customer performance metrics
  - Low stock inventory alerts
- **Key Metrics**:
  - Total sales revenue
  - Total expenses spent
  - Outstanding customer debts
  - Customer count
  - Product inventory count
  - Low stock item alerts

### 💳 Sales Management
- Create and track sales transactions
- Automatic inventory deduction when sales are made
- Customer-based sales history
- Automatic debt creation for credit sales
- Payment status tracking (pending/paid)
- Detailed sales notes and documentation

### 📦 Inventory Management
- Complete product catalog with SKU tracking
- Real-time stock quantity management
- Unit cost and selling price tracking
- Automatic profit margin calculation
- Reorder level alerts
- Low stock notifications
- Product categorization
- Bulk product management

### 👥 Customer Management
- Complete customer database
- Contact information (email, phone, address)
- Credit limit management
- Total debt tracking per customer
- Detailed customer profiles
- Geographic information (city, state, ZIP)

### 💰 Debt Management
- Track all customer debts
- Payment recording system
- Multiple payment methods (cash, check, bank transfer, card)
- Outstanding debt calculations
- Debt status tracking (pending/paid)
- Payment history per customer
- Automatic debt balance updates

### 💸 Expense Tracking
- Expense categorization system
- Multiple payment methods support
- Date-based expense filtering
- Expense status tracking (paid/pending)
- Category-wise expense breakdown
- Expense analytics and reporting
- Average expense calculations
- Notes and documentation for each expense

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **SQLite3**: Lightweight database
- **JWT**: Authentication and authorization
- **Bcrypt**: Password encryption
- **CORS**: Cross-Origin Resource Sharing

### Frontend
- **React 18**: UI library
- **React Router**: Navigation
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization
- **Lucide React**: Icon library
- **Vite**: Build tool

## 📋 System Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Port: 5173    │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │
│   (Express.js)  │
│   Port: 5000    │
└────────┬────────┘
         │
┌────────▼────────┐
│   Database      │
│   (SQLite)      │
│   business.db   │
└─────────────────┘
```

## 📁 Project Structure

```
sme-business-management-platform/
├── server/
│   ├── index.js                 # Main server file
│   ├── db/
│   │   ├── init.js             # Database initialization
│   │   ├── connection.js       # Database connection management
│   │   └── seed.js             # Demo data seeding
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   └── routes/
│       ├── auth.js             # Auth endpoints
│       ├── sales.js            # Sales endpoints
│       ├── inventory.js        # Inventory endpoints
│       ├── customers.js        # Customer endpoints
│       ├── expenses.js         # Expense endpoints
│       └── dashboard.js        # Dashboard analytics endpoints
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Main app component
│   ├── index.css               # Global styles
│   ├── components/
│   │   └── Navbar.jsx          # Navigation component
│   └── pages/
│       ├── Login.jsx           # Login page
│       ├── Register.jsx        # Registration page
│       ├── Dashboard.jsx       # Dashboard page
│       ├── Sales.jsx           # Sales management page
│       ├── Inventory.jsx       # Inventory management page
│       ├── Customers.jsx       # Customer management page
│       └── Expenses.jsx        # Expense tracking page
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── index.html                  # HTML template
```

## 🗄️ Database Schema

### Users Table
```sql
users(
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT (hashed),
  name TEXT,
  role TEXT DEFAULT 'admin',
  created_at DATETIME,
  updated_at DATETIME
)
```

### Products Table
```sql
products(
  id TEXT PRIMARY KEY,
  name TEXT,
  sku TEXT UNIQUE,
  description TEXT,
  quantity INTEGER,
  unit_cost DECIMAL,
  selling_price DECIMAL,
  category TEXT,
  reorder_level INTEGER,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Customers Table
```sql
customers(
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  total_debt DECIMAL,
  credit_limit DECIMAL,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Sales Table
```sql
sales(
  id TEXT PRIMARY KEY,
  customer_id TEXT FOREIGN KEY,
  sale_date DATETIME,
  total_amount DECIMAL,
  payment_status TEXT,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Sale Items Table
```sql
sale_items(
  id TEXT PRIMARY KEY,
  sale_id TEXT FOREIGN KEY,
  product_id TEXT FOREIGN KEY,
  quantity INTEGER,
  unit_price DECIMAL,
  total DECIMAL
)
```

### Customer Debts Table
```sql
customer_debts(
  id TEXT PRIMARY KEY,
  customer_id TEXT FOREIGN KEY,
  sale_id TEXT FOREIGN KEY,
  amount DECIMAL,
  paid_amount DECIMAL,
  remaining_amount DECIMAL,
  due_date DATETIME,
  status TEXT (pending/paid),
  created_at DATETIME,
  updated_at DATETIME
)
```

### Payments Table
```sql
payments(
  id TEXT PRIMARY KEY,
  debt_id TEXT FOREIGN KEY,
  amount DECIMAL,
  payment_date DATETIME,
  payment_method TEXT,
  notes TEXT,
  created_at DATETIME
)
```

### Expenses Table
```sql
expenses(
  id TEXT PRIMARY KEY,
  category TEXT,
  description TEXT,
  amount DECIMAL,
  expense_date DATETIME,
  payment_method TEXT,
  status TEXT (paid/pending),
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Expense Categories Table
```sql
expense_categories(
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  description TEXT,
  created_at DATETIME
)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/FwDubbb/sme-business-management-platform.git
cd sme-business-management-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file and update values as needed:
```
PORT=5000
NODE_ENV=development
DB_PATH=./data/business.db
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

4. **Initialize the database**
```bash
npm run db:init
```

5. **Start the development servers**
```bash
npm run dev
```

This will start both:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173`

### Access the Application
- Open your browser and navigate to `http://localhost:5173`
- Create a new account or login with existing credentials

## 📚 API Documentation

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: { token, user }
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { token, user }
```

### Sales Endpoints

#### Create Sale
```
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": "cust-123",
  "items": [
    {
      "product_id": "prod-123",
      "quantity": 2,
      "unit_price": 100
    }
  ],
  "notes": "Optional notes"
}
```

#### Get All Sales
```
GET /api/sales
Authorization: Bearer {token}
```

#### Get Sale by ID
```
GET /api/sales/:id
Authorization: Bearer {token}
```

### Inventory Endpoints

#### Add Product
```
POST /api/inventory/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Product Name",
  "sku": "SKU123",
  "description": "Product description",
  "quantity": 50,
  "unit_cost": 100,
  "selling_price": 150,
  "category": "Electronics",
  "reorder_level": 10
}
```

#### Get All Products
```
GET /api/inventory/products
Authorization: Bearer {token}
```

#### Get Low Stock Products
```
GET /api/inventory/low-stock
Authorization: Bearer {token}
```

#### Update Product Quantity
```
PATCH /api/inventory/products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 45
}
```

### Customer Endpoints

#### Add Customer
```
POST /api/customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "city": "City",
  "state": "State",
  "zip_code": "12345",
  "credit_limit": 5000
}
```

#### Get All Customers
```
GET /api/customers
Authorization: Bearer {token}
```

#### Get Customer Debts
```
GET /api/customers/:id/debts
Authorization: Bearer {token}
```

#### Record Payment
```
POST /api/customers/:id/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "debt_id": "debt-123",
  "amount": 500,
  "payment_method": "cash"
}
```

### Expense Endpoints

#### Add Expense Category
```
POST /api/expenses/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Office Supplies",
  "description": "Office supplies and stationery"
}
```

#### Get Expense Categories
```
GET /api/expenses/categories
Authorization: Bearer {token}
```

#### Add Expense
```
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "Office Supplies",
  "description": "Printer ink",
  "amount": 50,
  "payment_method": "cash",
  "status": "paid",
  "notes": "For office printer"
}
```

#### Get All Expenses
```
GET /api/expenses
Authorization: Bearer {token}
```

#### Get Expenses by Date Range
```
GET /api/expenses/range/:startDate/:endDate
Authorization: Bearer {token}
```

### Dashboard Endpoints

#### Get Dashboard Statistics
```
GET /api/dashboard/stats
Authorization: Bearer {token}

Response:
{
  "totalSales": 15000,
  "totalExpenses": 3000,
  "totalDebts": 5000,
  "customerCount": 25,
  "productCount": 50,
  "lowStockCount": 3
}
```

#### Get Sales Trend (Last 30 Days)
```
GET /api/dashboard/sales-trend
Authorization: Bearer {token}

Response: Array of { date, amount }
```

#### Get Expense Breakdown
```
GET /api/dashboard/expense-breakdown
Authorization: Bearer {token}

Response: Array of { category, total, count }
```

#### Get Top Customers
```
GET /api/dashboard/top-customers
Authorization: Bearer {token}

Response: Array of top 10 customers with stats
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Protection**: Cross-Origin Resource Sharing controls
- **Environment Variables**: Sensitive data in `.env` files
- **Input Validation**: Server-side validation of all inputs

## 📊 Key Workflows

### Creating a Sale
1. Navigate to Sales page
2. Click "New Sale" button
3. Select customer
4. Add products and quantities
5. System automatically:
   - Calculates total
   - Deducts inventory
   - Creates debt record
   - Updates customer total debt

### Managing Customer Debts
1. Go to Customers page
2. Select a customer from the list
3. View pending debts
4. Click "Record Payment"
5. System automatically:
   - Updates debt status
   - Records payment history
   - Updates customer balance

### Tracking Expenses
1. Create expense categories (if needed)
2. Navigate to Expenses page
3. Click "New Expense"
4. Fill in details and submit
5. View analytics and breakdowns

### Inventory Management
1. Go to Inventory page
2. Add new products with costs and prices
3. Set reorder levels
4. Monitor low stock alerts
5. View profit margins automatically

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark-Aware Color Scheme**: Modern, professional appearance
- **Intuitive Navigation**: Clear menu structure
- **Real-time Statistics**: Cards showing key metrics
- **Data Visualization**: Charts for trends and breakdowns
- **Search and Filter**: Quick data lookup
- **Status Indicators**: Color-coded statuses (paid, pending, low stock)
- **Loading States**: User feedback during operations
- **Error Handling**: Clear error messages

## 📈 Scaling the Application

### For Production Deployment
1. Replace SQLite with PostgreSQL or MySQL for multi-user scenarios
2. Implement Redis for caching
3. Add email notifications
4. Implement backup and recovery
5. Add audit logging
6. Set up SSL/TLS
7. Implement rate limiting
8. Add two-factor authentication

### Performance Optimizations
1. Database indexing on frequently queried columns
2. Pagination for large datasets
3. Image compression and CDN
4. Frontend code splitting
5. Lazy loading of components

## 🐛 Troubleshooting

### Database Not Found
```bash
npm run db:init
```

### Port Already in Use
Change PORT in `.env` file or kill the process using the port

### CORS Errors
Check `CORS` configuration in `server/index.js` and ensure `CLIENT_URL` in `.env` matches your frontend URL

### Authentication Errors
Verify JWT_SECRET is set in `.env` and tokens are being sent correctly

## 📝 Development Guidelines

### Code Style
- Use meaningful variable names
- Comment complex logic
- Follow REST API conventions
- Use async/await for asynchronous code

### Testing
- Test all CRUD operations
- Test error scenarios
- Verify calculations (totals, margins)
- Test with multiple users

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues, questions, or suggestions, please create an issue on GitHub.

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Recharts Documentation](https://recharts.org/)

---

**Built with ❤️ for SME business owners**
