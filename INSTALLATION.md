# Installation and Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning the repository)
- A code editor (VS Code recommended)

## 🔧 Step-by-Step Installation

### 1. Clone or Download the Repository

**Option A: Using Git**
```bash
git clone https://github.com/FwDubbb/sme-business-management-platform.git
cd sme-business-management-platform
```

**Option B: Download ZIP**
- Download the repository as ZIP
- Extract to your desired location
- Open terminal/command prompt in the extracted folder

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages from `package.json`. This may take a few minutes.

### 3. Environment Configuration

**Copy the example environment file:**
```bash
cp .env.example .env
```

**On Windows (if cp doesn't work):**
```bash
copy .env.example .env
```

**Edit the `.env` file with your preferences:**
```
PORT=5000
NODE_ENV=development
DB_PATH=./data/business.db
JWT_SECRET=your_super_secret_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

### 4. Initialize the Database

```bash
npm run db:init
```

This command will:
- Create the `data` directory
- Create `business.db` SQLite database
- Initialize all required tables

**Output should show:**
```
Initializing database...
✅ Database initialized successfully!
```

### 5. Start the Development Servers

**Start both frontend and backend simultaneously:**
```bash
npm run dev
```

**Or start them separately:**

**Terminal 1 - Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run client:dev
```

**Output should show:**
```
🚀 Server running on http://localhost:5000
```

And for frontend:
```
  VITE v5.0.0  ready in 234 ms
  ➜  Local:   http://localhost:5173/
```

### 6. Access the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

You should see the SME Manager login page.

## 📝 First Time Setup

### Create Your First Account

1. Click on "Register" on the login page
2. Fill in your details:
   - Name: Your business name or personal name
   - Email: Your email address
   - Password: A strong password
3. Click "Register"
4. You'll be automatically logged in and redirected to the dashboard

### First Steps

1. **Add Your First Product**
   - Go to "Inventory" menu
   - Click "Add Product"
   - Fill in product details (name, SKU, cost, price)
   - Click "Add Product"

2. **Add a Customer**
   - Go to "Customers" menu
   - Click "Add Customer"
   - Fill in customer information
   - Click "Add Customer"

3. **Record Your First Sale**
   - Go to "Sales" menu
   - Click "New Sale"
   - Select a customer
   - Add products from inventory
   - Click "Create Sale"

4. **Track Expenses**
   - Go to "Expenses" menu
   - Click "New Category" (first time only)
   - Add an expense category
   - Click "New Expense"
   - Record your expenses

## 🚀 Development Commands

```bash
# Start both servers in development mode
npm run dev

# Start only the backend server
npm run server:dev

# Start only the frontend
npm run client:dev

# Initialize the database
npm run db:init

# Seed demo data (if available)
npm run db:seed

# Build for production
npm run build

# Preview production build locally
npm run preview

# Start production server
npm start
```

## 📁 Project Structure After Installation

```
sme-business-management-platform/
├── node_modules/              # Installed dependencies
├── data/                       # Database directory (created after db:init)
│   └── business.db            # SQLite database file
├── server/                     # Backend code
├── src/                        # Frontend code
├── .env                        # Environment variables (created from .env.example)
├── .gitignore                  # Git ignore file
├── package.json                # Project configuration
├── vite.config.js              # Vite configuration
└── README.md                   # Documentation
```

## ✅ Verify Installation

### Check Backend
1. Open browser and go to `http://localhost:5000/api/health`
2. You should see: `{ "status": "Server is running" }`

### Check Frontend
1. Open browser and go to `http://localhost:5173`
2. You should see the login page

### Check Database
1. Look for `data/business.db` file in project root
2. File size should be > 0 KB

## 🔧 Troubleshooting

### Issue: "npm command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Port 5000 already in use"
**Solution:** 
- Change PORT in `.env` file
- Or kill the process using the port:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -ti:5000 | xargs kill -9`

### Issue: "Database initialization fails"
**Solution:** 
- Delete `data` folder if it exists
- Run `npm run db:init` again
- Check write permissions in project directory

### Issue: "Cannot POST /api/auth/register"
**Solution:**
- Ensure backend server is running (`npm run server:dev`)
- Check that `CORS` is configured correctly
- Check that `CLIENT_URL` in `.env` matches your frontend URL

### Issue: "Cannot find module 'sqlite3'"
**Solution:**
```bash
npm install sqlite3
npm rebuild
```

### Issue: "EACCES: permission denied"
**Solution (Mac/Linux):**
```bash
sudo chown -R $USER:$USER .
```

## 🌐 Network Access

### Access from Other Computers

1. Find your local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update `.env`:
   ```
   CLIENT_URL=http://<YOUR_IP>:5173
   ```

3. Access from other computer:
   ```
   http://<YOUR_IP>:5173
   ```

## 📦 Building for Production

```bash
# Build the frontend
npm run build

# The built files will be in the 'dist' folder

# Start production server
NODE_ENV=production npm start
```

## 🔐 Production Deployment

Before deploying:
1. Change `JWT_SECRET` to a strong, random string
2. Set `NODE_ENV=production` in `.env`
3. Use a production database (PostgreSQL recommended)
4. Set up HTTPS/SSL
5. Configure proper CORS for your domain
6. Set up environment variables securely
7. Use a process manager like PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server/index.js --name "sme-manager"

# Setup auto-restart on system reboot
pm2 startup
pm2 save
```

## 📚 Next Steps

1. Explore the Dashboard to understand your business metrics
2. Set up your product inventory
3. Add your customers
4. Start tracking sales and expenses
5. Monitor customer debts
6. Use reports for business insights

## 🆘 Getting Help

- Check GitHub Issues: https://github.com/FwDubbb/sme-business-management-platform/issues
- Review Documentation: See README.md
- Check logs in terminal for error messages

## 📞 Support

If you encounter any issues during installation, please:
1. Check the Troubleshooting section above
2. Review the error message carefully
3. Check terminal/console logs
4. Create an issue on GitHub with details about your problem

---

**Happy business management! 🎉**
