# Migration Guide: Consolidated Sale Update

## Quick Start

Follow these steps to migrate to the consolidated update architecture:

---

## Step 1: Database Migration

### Run the SQL Migration Script

1. Open SQL Server Management Studio (SSMS)
2. Connect to your database server
3. Open the file: `SQL_Migration_ConsolidatedUpdate.sql`
4. **IMPORTANT:** Update the database name on line 7:
   ```sql
   USE [YourDatabaseName];  -- Replace with your actual database name
   ```
5. Execute the entire script (F5)
6. Verify the output shows all procedures created successfully

### Expected Output

```
Adding EditDate column to SalesMaster table...
EditDate column added successfully.
Creating sp_UpdateSalesMasterWithDetails...
sp_UpdateSalesMasterWithDetails created successfully.
Updating sp_UpdateSalesMaster...
sp_UpdateSalesMaster updated successfully.
Updating sp_UpdateSalesDetail...
sp_UpdateSalesDetail updated successfully.
Updating sp_GetAllSalesMaster...
sp_GetAllSalesMaster updated successfully.

==============================================
MIGRATION COMPLETE
==============================================

Verifying stored procedures...
✓ sp_UpdateSalesMasterWithDetails exists
✓ sp_UpdateSalesMaster exists
✓ sp_UpdateSalesDetail exists
✓ sp_GetAllSalesMaster exists

Migration completed successfully!
```

---

## Step 2: Backend Code (Already Done)

The following files have been updated:

### DTOs
- ✅ `POSWebApi/DTOs/Request/SalesMasterRequestModels.cs`
  - Added `Details` property to `SalesMasterUpdateRequest`
  - Added `SalesMasterUpdateDetailItem` class

### Repository Layer
- ✅ `POSWebApi/Repositories/SalesMaster/Interface/ISalesMasterRepository.cs`
  - Added `UpdateWithDetailsAsync` method signature

- ✅ `POSWebApi/Repositories/SalesMaster/SalesMasterRepository.cs`
  - Implemented `UpdateWithDetailsAsync` method
  - Serializes details to JSON
  - Calls `sp_UpdateSalesMasterWithDetails`

### Service Layer
- ✅ `POSWebApi/Services/SalesMaster/SalesMasterService.cs`
  - Updated `Update` method to use consolidated approach
  - Validates details before calling repository
  - Chooses appropriate repository method based on whether details are provided

---

## Step 3: Frontend Code (Already Done)

The following files have been updated:

### Context
- ✅ `pos-app/src/contexts/SalesContext.jsx`
  - Updated `updateSaleMaster` to accept `details` parameter
  - Sends details array in PUT request

### Components
- ✅ `pos-app/src/features/sales/PointOfSale.jsx`
  - Simplified `handleUpdateSale` to single API call
  - Removed separate batch update/create logic
  - Sends all details (new and existing) in one call

---

## Step 4: Testing

### Manual Testing Checklist

#### Test 1: Update Sale with Modified Details
1. Open the POS application
2. Go to "Records" tab
3. Double-click an existing sale to edit
4. Modify quantity or discount of an existing item
5. Click "Update Sale"
6. ✅ Verify sale is updated successfully
7. ✅ Verify EditDate is updated
8. ✅ Verify changes are reflected in the grid

#### Test 2: Update Sale with New Details
1. Edit an existing sale
2. Add a new product using search or grid modal
3. Click "Update Sale"
4. ✅ Verify new item is added
5. ✅ Verify total is recalculated
6. ✅ Verify EditDate is updated

#### Test 3: Update Sale with Mixed Changes
1. Edit an existing sale
2. Modify an existing item (change quantity)
3. Add a new product
4. Click "Update Sale"
5. ✅ Verify both operations succeed
6. ✅ Verify total is correct
7. ✅ Verify EditDate is updated

#### Test 4: Sorting by EditDate
1. Edit and save a sale
2. Go to "Records" tab
3. ✅ Verify the edited sale appears at the top
4. Edit a different sale
5. ✅ Verify it now appears at the top

#### Test 5: Error Handling
1. Try to update with invalid data (e.g., negative quantity)
2. ✅ Verify appropriate error message is shown
3. ✅ Verify database is not modified

### SQL Testing

Run this test query to verify the stored procedure works:

```sql
-- Create a test sale first (if needed)
-- INSERT INTO SalesMaster (Total, SalespersonId, Comments) 
-- VALUES (1000.00, 1, 'Test sale');

-- Get the SaleId of your test sale
DECLARE @TestSaleId INT = 1;  -- Replace with actual SaleId

-- Prepare test data
DECLARE @DetailsJson NVARCHAR(MAX) = N'[
    {
        "saleDetailId": -1234567890,
        "productId": 1,
        "retailPrice": 500.00,
        "quantity": 2,
        "discount": 50.00
    },
    {
        "saleDetailId": -1234567891,
        "productId": 2,
        "retailPrice": 300.00,
        "quantity": 1,
        "discount": 0.00
    }
]';

-- Execute the consolidated update
EXEC sp_UpdateSalesMasterWithDetails
    @SaleId = @TestSaleId,
    @Total = 1250.00,
    @SalespersonId = 1,
    @Comments = 'Updated via consolidated SP',
    @DetailsJson = @DetailsJson;

-- Verify the results
SELECT * FROM SalesMaster WHERE SaleId = @TestSaleId;
SELECT * FROM SalesDetail WHERE SaleId = @TestSaleId;
```

---

## Step 5: Verify Changes

### Database Verification

```sql
-- Check if EditDate column exists
SELECT TOP 1 EditDate FROM SalesMaster;

-- Check if new stored procedure exists
SELECT OBJECT_ID('sp_UpdateSalesMasterWithDetails', 'P');

-- Verify sorting by EditDate
EXEC sp_GetAllSalesMaster;
```

### Application Verification

1. Open browser developer tools (F12)
2. Go to Network tab
3. Edit and update a sale
4. Find the PUT request to `/api/salesmaster`
5. ✅ Verify request payload includes `details` array
6. ✅ Verify only ONE request is made (not three)

**Expected Request Payload:**
```json
{
  "saleId": 123,
  "data": {
    "total": 1500.00,
    "salespersonId": 5,
    "comments": "Test"
  },
  "details": [
    {
      "saleDetailId": 456,
      "productId": 10,
      "retailPrice": 500.00,
      "quantity": 2,
      "discount": 50.00
    },
    {
      "saleDetailId": -1234567890,
      "productId": 20,
      "retailPrice": 300.00,
      "quantity": 1,
      "discount": 0.00
    }
  ]
}
```

---

## Rollback Plan

If you need to rollback the changes:

### Database Rollback

```sql
-- Drop the new stored procedure
DROP PROCEDURE IF EXISTS sp_UpdateSalesMasterWithDetails;

-- Restore original sp_UpdateSalesMaster (without EditDate)
ALTER PROCEDURE sp_UpdateSalesMaster
    @SaleId INT,
    @Total DECIMAL(18,2),
    @SalespersonId INT,
    @Comments NVARCHAR(500) = NULL
AS
BEGIN
    UPDATE SalesMaster
    SET 
        Total = @Total,
        SalespersonId = @SalespersonId,
        Comments = @Comments
    WHERE SaleId = @SaleId;
END
GO

-- Restore original sorting (by SaleId)
ALTER PROCEDURE sp_GetAllSalesMaster
AS
BEGIN
    SELECT 
        SaleId,
        Total,
        SaleDate,
        EditDate,
        SalespersonId,
        Comments
    FROM SalesMaster
    ORDER BY SaleId DESC;
END
GO
```

### Code Rollback

Use git to revert the changes:

```bash
# Backend
git checkout HEAD -- POSWebApi/DTOs/Request/SalesMasterRequestModels.cs
git checkout HEAD -- POSWebApi/Repositories/SalesMaster/
git checkout HEAD -- POSWebApi/Services/SalesMaster/

# Frontend
git checkout HEAD -- pos-app/src/contexts/SalesContext.jsx
git checkout HEAD -- pos-app/src/features/sales/PointOfSale.jsx
```

---

## Troubleshooting

### Issue: "Invalid object name 'sp_UpdateSalesMasterWithDetails'"

**Solution:** The stored procedure wasn't created. Run the migration script again.

### Issue: "Invalid column name 'EditDate'"

**Solution:** The EditDate column wasn't added. Run Step 1 of the migration script.

### Issue: Frontend shows "Failed to update sale"

**Possible Causes:**
1. Backend not restarted after code changes
2. Database migration not run
3. Invalid data being sent

**Solution:**
1. Restart the backend API
2. Check browser console for error details
3. Check backend logs for SQL errors

### Issue: Details not being updated

**Possible Causes:**
1. JSON serialization issue
2. Stored procedure not parsing JSON correctly

**Solution:**
1. Check the `@DetailsJson` parameter value in SQL Profiler
2. Verify JSON format matches expected structure (camelCase)
3. Check for SQL errors in backend logs

### Issue: Transaction deadlocks

**Possible Causes:**
1. Multiple concurrent updates to same sale
2. Long-running transactions

**Solution:**
1. Implement optimistic concurrency control
2. Add retry logic in frontend
3. Consider row-level locking hints

---

## Performance Considerations

### Before (3 API calls)
- Network latency: ~150ms × 3 = 450ms
- Database round trips: 3
- Transaction overhead: High (3 separate transactions)

### After (1 API call)
- Network latency: ~150ms × 1 = 150ms
- Database round trips: 1
- Transaction overhead: Low (1 transaction)

**Performance Improvement: ~66% reduction in latency**

---

## Support

If you encounter issues:

1. Check the documentation:
   - `CONSOLIDATED_UPDATE_ARCHITECTURE.md`
   - `STORED_PROCEDURE_CHANGES.md`

2. Review the code changes:
   - Backend: `POSWebApi/Services/SalesMaster/`
   - Frontend: `pos-app/src/features/sales/`

3. Check SQL Server logs for errors

4. Enable verbose logging in the backend

---

## Success Criteria

✅ Migration is successful when:

1. SQL migration script runs without errors
2. All stored procedures are created
3. Backend compiles without errors
4. Frontend compiles without errors
5. Can update existing sale with modified details
6. Can update existing sale with new details
7. EditDate is updated on every change
8. Sales are sorted by EditDate (most recent first)
9. Only ONE API call is made during update
10. Error handling works correctly

---

## Next Steps

After successful migration:

1. Monitor application logs for errors
2. Gather user feedback
3. Consider implementing:
   - Delete details support
   - Optimistic concurrency control
   - Audit trail logging
   - Bulk update operations

---

## Conclusion

This migration consolidates the sale update operation into a single, atomic transaction, improving performance, reliability, and maintainability. The changes are backward compatible, and the old endpoints remain functional for any legacy code.
