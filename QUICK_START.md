# 🚀 Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js installed ([Download](https://nodejs.org/))
- Git (optional)

### Step 1: Download & Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/FwDubbb/sme-business-management-platform.git
cd sme-business-management-platform

# Install dependencies
npm install
```

### Step 2: Configure (1 minute)

```bash
# Copy environment file
cp .env.example .env

# Initialize database
npm run db:init
```

### Step 3: Start (1 minute)

```bash
# Start development servers
npm run dev
```

**Output:**
```
🚀 Server running on http://localhost:5000
VITE v5.0.0  ready in 234 ms
➜  Local:   http://localhost:5173/
```

### Step 4: Access & Use (1 minute)

1. Open browser: http://localhost:5173
2. Click "Register"
3. Create your account
4. Start managing your business!

---

## 📋 First Steps Checklist

- [ ] Register your account
- [ ] Add 3 products to inventory
- [ ] Add 2 customers
- [ ] Create your first sale
- [ ] Record an expense
- [ ] Check the dashboard

---

## 🎯 Core Features Overview

### Dashboard 📊
- Real-time business metrics
- Sales trends and charts
- Expense breakdown
- Key alerts

**Access:** Click "Dashboard" in menu after login

### Inventory 📦
- Add/manage products
- Track stock levels
- View profit margins
- Get low stock alerts

**Quick Add:** Dashboard → Inventory → Add Product

### Customers 👥
- Maintain customer database
- Track customer debts
- Record payments
- View customer history

**Quick Add:** Customers → Add Customer

### Sales 💳
- Create sales transactions
- Automatic inventory deduction
- Track payment status
- View sales history

**Quick Create:** Sales → New Sale

### Expenses 💰
- Categorize expenses
- Track spending patterns
- View expense analytics
- Filter by date range

**Quick Add:** Expenses → New Expense

### Debts 💸
- View all customer debts
- Record payments
- Track payment status
- Monitor collections

**Access:** Customers → Select Customer → View Debts

---

## 💡 Usage Examples

### Example 1: Record Your First Sale

1. Go to **Sales** tab
2. Click **New Sale**
3. Select a customer
4. Add products with quantities
5. Click **Create Sale**
6. ✅ Debt automatically created for customer
7. ✅ Inventory automatically updated

### Example 2: Track Expenses

1. Go to **Expenses** tab
2. Click **New Category** (first time)
3. Add expense category (e.g., "Office Supplies")
4. Click **New Expense**
5. Fill in expense details
6. Click **Add Expense**
7. ✅ View analytics in Expense Breakdown chart

### Example 3: Collect Payment from Customer

1. Go to **Customers** tab
2. Click on a customer
3. Click **Record Payment**
4. Select debt to pay
5. Enter payment amount
6. Choose payment method
7. Click **Record Payment**
8. ✅ Debt automatically updated

### Example 4: Monitor Low Stock

1. Go to **Inventory** tab
2. Check **Low Stock Only** checkbox
3. View products below reorder level
4. Update quantities when restocking
5. System alerts you automatically

---

## 🎨 Interface Guide

### Navigation
```
┌─ Dashboard
├─ Sales
├─ Inventory  
├─ Customers
└─ Expenses
```

### Color Coding
- 🟢 **Green** = Good status, High values, In stock
- 🟡 **Yellow** = Warning, Low stock, Pending
- 🔴 **Red** = Alert, Debt, Overdue
- 🔵 **Blue** = Information, Neutral

### Status Indicators
- **Paid** = Transaction completed
- **Pending** = Awaiting payment/action
- **Low** = Stock below reorder level

---

## 📊 Understanding Reports

### Dashboard Cards
```
┌─────────────────────┐
│  Total Sales        │  All revenue from sales
│  $50,000            │  
└─────────────────────┘

┌─────────────────────┐
│  Total Expenses     │  All money spent
│  $15,000            │  
└─────────────────────┘

┌─────────────────────┐
│  Outstanding Debts  │  Money customers owe
│  $8,000             │  
└─────────────────────┘
```

### Charts

**Sales Trend**: Shows sales over last 30 days
**Expense Breakdown**: Shows spending by category
**Top Customers**: Shows best customers by revenue
**Inventory**: Shows stock levels and profits

---

## 🔧 Common Tasks

### Add a New Product
```
Inventory → Add Product → Fill Form → Save
Required: Name, SKU, Cost, Price, Quantity
```

### Add a New Customer
```
Customers → Add Customer → Fill Form → Save
Required: Name (Email, Phone optional)
```

### Create a Sale
```
Sales → New Sale → Select Customer → Add Products → Save
Automatic: Inventory deduction, Debt creation
```

### Record Payment
```
Customers → Select Customer → Record Payment → Fill Form → Save
Automatic: Debt update, Balance calculation
```

### Add Expense
```
Expenses → New Expense → Select Category → Fill Form → Save
Automatic: Analytics update
```

### View Reports
```
Dashboard → Scroll down → View Charts
Automatic: Updates in real-time
```

---

## 🔐 Account Security

✅ **Do:**
- Use a strong password (8+ chars, mix of numbers and letters)
- Keep your login credentials safe
- Logout when done using shared computers
- Change password regularly

❌ **Don't:**
- Share your login details
- Use simple passwords
- Save login on public computers
- Share your JWT token

---

## 📱 Device Compatibility

| Device | Status | Notes |
|--------|--------|-------|
| Desktop | ✅ Full support | Best experience |
| Laptop | ✅ Full support | Recommended |
| Tablet | ✅ Good | May need zooming |
| Mobile | ⚠️ Limited | View-only recommended |

---

## ⚡ Tips & Tricks

### Speed Up Data Entry
- Use Tab to move between fields
- Use Enter to submit forms
- Bookmark frequently used pages
- Search/filter to find items quickly

### Organize Your Data
- Use consistent SKU naming (e.g., CAT-001, CAT-002)
- Categorize products logically
- Add notes to unusual transactions
- Create expense categories that match your business

### Monitor Your Business
- Check dashboard daily for key metrics
- Review sales trend weekly
- Monitor expense breakdown monthly
- Follow up on overdue customer debts

### Data Management
- Regularly add new products to inventory
- Keep customer information updated
- Record all expenses promptly
- Follow up on pending payments

---

## 🆘 Troubleshooting

### App Won't Start
```bash
# Check if port is in use
npm run dev

# If error about port 5000/5173:
# Kill the process or change PORT in .env
```

### Database Issues
```bash
# Reinitialize database
rm -rf data/
npm run db:init
```

### Can't Login
- Check email spelling
- Verify password (case-sensitive)
- Use "Register" if account doesn't exist

### Missing Data
- Refresh the page (Ctrl+R or Cmd+R)
- Check if you're viewing the right date range
- Verify filters aren't hiding data

### Performance Slow
- Close other browser tabs
- Clear browser cache
- Restart the application
- Check internet connection

---

## 📞 Getting Help

### Documentation
- **README.md** - Full project documentation
- **INSTALLATION.md** - Detailed setup guide
- **API_REFERENCE.md** - API endpoints reference
- **QUICK_START.md** - This file!

### Support Channels
1. Check documentation first
2. Review error messages in browser console
3. Check terminal for server errors
4. Create issue on GitHub

### Share Feedback
- Report bugs on GitHub Issues
- Suggest features
- Share your experience

---

## 🎓 Learning Paths

### Beginner (Day 1)
- [ ] Setup the application
- [ ] Create account
- [ ] Explore dashboard
- [ ] Add 5 products
- [ ] Add 3 customers

### Intermediate (Week 1)
- [ ] Create 10 sales
- [ ] Record payments
- [ ] Add expenses
- [ ] Analyze reports
- [ ] Manage inventory

### Advanced (Month 1+)
- [ ] Optimize data entry
- [ ] Create backup strategy
- [ ] Analyze business metrics
- [ ] Plan growth
- [ ] Integrate with accounting

---

## 🚀 Next Steps

1. **Customize Your System**
   - Add your company name
   - Set up expense categories
   - Create product categories

2. **Populate Your Data**
   - Import existing customer list
   - Add all current inventory
   - Enter recent sales

3. **Set Up Workflows**
   - Daily: Check dashboard
   - Weekly: Review sales
   - Monthly: Analyze expenses

4. **Integrate**
   - Connect to accounting
   - Sync with other tools
   - Export reports

---

## 📊 Dashboard Metrics Explained

### Total Sales
Sum of all sales revenue (what customers paid)

### Total Expenses  
Sum of all business expenses (what you spent)

### Outstanding Debts
Money customers still owe (unpaid sales)

### Profit
= Total Sales - Total Expenses

### Low Stock Items
Products below reorder level (need restocking)

---

## 💾 Data Backup

### Automatic Backup (Create backup copies)
1. Copy `data/business.db` file
2. Store in safe location
3. Do weekly

### Export Data
- Take screenshots of reports
- Export tables to Excel
- Keep records organized

---

## 🎯 Success Metrics

Track these to monitor business health:
- 📈 Sales trend (should go up)
- 💰 Profit margin (higher = better)
- 💳 Collection rate (should be 100%)
- 📦 Inventory turnover (faster = better)
- 💸 Expense ratio (should decrease)

---

## 📚 Full Documentation

For detailed information, see:
- [README.md](./README.md) - Complete overview
- [INSTALLATION.md](./INSTALLATION.md) - Setup guide
- [API_REFERENCE.md](./API_REFERENCE.md) - API docs

---

## ✨ You're All Set!

You're ready to:
- ✅ Manage your business efficiently
- ✅ Track all operations in one place
- ✅ Make data-driven decisions
- ✅ Grow your business systematically

**Happy Business Managing! 🎉**

---

*Last Updated: January 2024*
*Version: 1.0.0*
