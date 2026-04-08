# Quick Start Guide - Testing New Features

## Backend Setup

### 1. Update server imports
The server.js has already been updated with new route imports and endpoint registrations.

### 2. Verify MongoDB Models
All new models are created in `/models`:
- MenuItem.js
- Supplier.js
- StockMovement.js
- SyncLog.js
- DayEndReport.js

### 2.1 Start Local MongoDB
Make sure a local MongoDB server is running on `mongodb://127.0.0.1:27017`.

The backend is configured to use the `restaurant_pos` database by default.

### 3. Start Backend
```bash
cd pos-backend
npm install
npm run dev
```

The server should show all new routes registered:
- POST /api/inventory
- GET /api/inventory
- POST /api/suppliers
- GET /api/suppliers
- POST /api/reports/generate
- GET /api/reports
- POST /api/sync/download
- POST /api/sync/upload
- POST /api/sync/bidirectional

---

## Frontend Setup

### 1. Install Dependencies
No new packages needed - existing dependencies cover all features.

### 2. Start Frontend
```bash
cd pos-frontend
npm run dev
```

### 3. Access New Pages
- **Stock Management**: http://localhost:5173/inventory
- **Supplier Management**: http://localhost:5173/suppliers
- **Day-End Reports**: http://localhost:5173/reports

---

## Testing Workflows

### Stock Management Testing
1. Login to system
2. Navigate to Stock Management (Desktop sidebar or mobile more menu)
3. View stock overview metrics
4. Filter by "Low Stock" or "Out of Stock"
5. Click "Add Stock" on any item
6. Enter quantity and notes
7. Verify stock increases in card
8. Check audit trail in stock movements

### Order with Stock Reduction
1. Create new order from menu
2. Add items to cart
3. Place order
4. Check that stock automatically reduces
5. Try placing order with insufficient stock - should show error

### Supplier Management
1. Navigate to Supplier Management
2. Click "Add Supplier"
3. Fill in supplier details
4. Save supplier
5. Edit supplier information
6. Link items to supplier
7. Delete supplier if needed

### Day-End Reporting
1. Navigate to Day-End Reports
2. Adjust date range if needed
3. Click "Generate Today" to create report for current date
4. Select report from list to view details
5. View payment breakdown and top items
6. Export report as CSV

### Responsive Design Testing
1. Open app on desktop browser
2. Verify sidebar navigation appears
3. Resize browser to < 1024px (tablet/mobile)
4. Verify bottom navigation appears instead
5. Click "More" menu to access additional features
6. Test content reflows properly

### Offline Sync Testing (requires browser dev tools)
1. Open browser DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Navigate to Menu and add items to cart
5. Create an order (will queue locally)
6. Set Network back to "Online"
7. Verify sync happens automatically
8. Check that pending orders are synced

---

## API Testing with cURL/Postman

### Get Stock Summary
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/inventory/summary
```

### Add Stock
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"itemId":"<id>","quantity":10,"notes":"Restocking"}' \
  http://localhost:8000/api/inventory/add-stock
```

### Create Supplier
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"ABC Foods",
    "contactPerson":"John",
    "phone":"9876543210",
    "email":"john@abc.com",
    "paymentTerms":"Credit",
    "creditDays":30
  }' \
  http://localhost:8000/api/suppliers
```

### Generate Day-End Report
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-03-16","notes":"Daily summary"}' \
  http://localhost:8000/api/reports/generate
```

---

## Troubleshooting

### Stock page shows empty
- Ensure MenuItem records exist in MongoDB
- Check user has proper permissions (admin or staff)
- Verify API endpoint is returning data

### Supplier form not submitting
- Check all required fields are filled
- Verify API is responding correctly
- Check browser console for errors

### Reports not generating
- Ensure orders exist for the date
- Check date format (YYYY-MM-DD)
- Verify MongoDB aggregation pipeline

### Responsive layout not working
- Check browser window size (< 1024px for mobile nav)
- Verify Tailwind CSS lg breakpoint is working
- Check for CSS conflicts

### Sync not triggering
- Verify localStorage is enabled in browser
- Check Network tab to see sync requests
- Ensure online/offline events are firing

---

## Default Test Data

To test features, create some sample data:

1. **Sample Items**: Use existing menu items from data.js
2. **Sample Supplier**: "Fresh Foods Inc"
3. **Sample Order**: Create order to test stock reduction

---

## Performance Tips

1. Keep stock lookup efficient with indexed queries
2. Batch stock updates in transactions
3. Limit report date ranges when querying
4. Use pagination for large lists
5. Cache supplier list in frontend when possible

---

## Next Steps After Testing

1. Seed production data into MongoDB
2. Set up admin role verification
3. Configure reporting schedules
4. Set up notification system for low stock
5. Implement barcode scanning for stock
6. Add inventory forecasting

---

## Support Commands

### Clear localStorage (for resetting sync state)
```javascript
localStorage.clear();
```

### Check pending data in localStorage
```javascript
console.log(JSON.parse(localStorage.getItem('pendingOrders')));
console.log(JSON.parse(localStorage.getItem('pendingUpdates')));
```

### Monitor sync events
```javascript
window.addEventListener('dataSync', (e) => {
  console.log('Data synced:', e.detail);
});
```

---

## Documentation Reference
See `FEATURE_IMPLEMENTATION.md` for detailed feature documentation.
