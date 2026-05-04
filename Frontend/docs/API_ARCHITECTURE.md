# API Architecture Documentation

## Overview

This document explains the API design patterns used in the POS application, particularly focusing on the master-detail relationship pattern for sales data.

## Sales API Structure

### Master-Detail Pattern

The Sales API follows a **master-detail relationship pattern** where sales data is split into two separate resources:

1. **Sales Master (Header)** - Contains the sale-level information
2. **Sales Details (Line Items)** - Contains the individual product items in the sale

### Why Two Separate API Calls?

When fetching a complete sale with its items, the frontend makes **two API calls**:

```javascript
// 1. Fetch sale master (header)
POST /api/salesmaster/get
Payload: { saleId: 123 }
Returns: { saleId, salespersonId, total, comments, saleDate, editDate }

// 2. Fetch sale details (line items)
POST /api/salesmaster/salesdetails/list
Payload: { saleId: 123 }
Returns: [{ saleDetailId, productId, quantity, retailPrice, discount, lineTotal }, ...]
```

### Rationale

This design is **intentional and follows best practices** for several reasons:

#### 1. **Database Normalization**
- Sales data is stored in two separate tables: `SalesMaster` and `SalesDetail`
- This follows the one-to-many relationship pattern (one sale has many details)
- Prevents data duplication and maintains referential integrity

#### 2. **Backend Service Separation**
- The backend has two separate services:
  - `ISalesMasterService` - Handles sale header operations
  - `ISalesDetailService` - Handles line item operations
- This follows the Single Responsibility Principle (SRP)
- Each service manages its own domain logic

#### 3. **Independent CRUD Operations**
- Master and details can be created, updated, and deleted independently
- Example: You can update the sale total or comments without touching the details
- Example: You can add/remove/update individual line items without affecting the master

#### 4. **Flexibility and Scalability**
- Allows for batch operations on details (batch create, batch update)
- Supports partial updates (update only what changed)
- Enables future features like:
  - Fetching only the master without details (for list views)
  - Fetching only specific details (for item-level operations)
  - Paginating details for sales with many items

#### 5. **Performance Optimization**
- The list view (`/salesmaster` GET) returns only master data (no details)
- Details are fetched only when needed (when editing a sale)
- This reduces payload size for list operations

### API Endpoints Summary

#### Sales Master Endpoints
```
POST   /api/salesmaster              - Create new sale
GET    /api/salesmaster              - Get all sales (master only)
POST   /api/salesmaster/get          - Get single sale master by ID
PUT    /api/salesmaster              - Update sale master
DELETE /api/salesmaster              - Delete sale (cascades to details)
```

#### Sales Details Endpoints
```
POST   /api/salesmaster/salesdetails              - Add single detail to sale
POST   /api/salesmaster/salesdetails/list         - Get all details for a sale
POST   /api/salesmaster/salesdetails/get          - Get single detail by ID
PUT    /api/salesmaster/salesdetails              - Update single detail
DELETE /api/salesmaster/salesdetails              - Delete single detail
PUT    /api/salesmaster/salesdetails/batch        - Batch update details
POST   /api/salesmaster/salesdetails/batch        - Batch create details
```

## Frontend Implementation

### Context-Based State Management

The frontend uses React Context API to manage sales state:

```javascript
// SalesContext provides:
- items: []              // All sales (master only)
- currentSale: {}        // Currently selected sale (master + details)
- fetchSales()           // Fetches all sales (master only)
- fetchSaleById(id)      // Fetches master + details (2 API calls)
- createSaleMaster()     // Creates sale header
- batchCreateSaleDetails() // Creates all line items
- updateSaleMaster()     // Updates sale header
- batchUpdateSaleDetails() // Updates line items
- deleteSale()           // Deletes sale (cascades)
```

### Optimistic Updates

The Context implements optimistic updates for better UX:
- When creating/updating, the UI updates immediately
- No need to refetch data after successful operations
- State is managed in-memory and synced with the backend

## Common Patterns

### Creating a New Sale
```javascript
1. createSaleMaster({ total, salespersonId, comments })
   → Returns saleId
2. batchCreateSaleDetails({ saleId, details: [...] })
   → Creates all line items in one call
```

### Editing an Existing Sale
```javascript
1. fetchSaleById(saleId)
   → Makes 2 calls: get master + get details
   → Loads into currentSale state
2. User modifies items locally (updateLocalItem, addLocalItem, removeLocalItem)
   → Updates only in-memory state
3. On save:
   - batchUpdateSaleDetails() for existing items
   - batchCreateSaleDetails() for new items
   - updateSaleMaster() for header changes
```

### Viewing Sales List
```javascript
fetchSales()
→ GET /api/salesmaster
→ Returns only master data (no details)
→ Efficient for list views
```

## Performance Considerations

### Current Performance Characteristics
- **List View**: Single API call, minimal payload
- **Edit View**: Two API calls, full data loaded
- **Save Operation**: 2-3 API calls (batch operations reduce round trips)

### When Two Calls Are Acceptable
- Network latency is low (local network or fast internet)
- Sales typically have < 100 line items
- The two calls happen sequentially and complete quickly
- User experience is not impacted (loading states are shown)

### When to Consider Optimization
If you experience:
- High network latency (> 500ms per request)
- Sales with hundreds of line items
- Frequent complaints about slow loading
- High server load from redundant queries

Then consider creating a combined endpoint:
```
POST /api/salesmaster/getwithdetails
→ Returns master + details in one response
→ Requires backend changes
```

## Conclusion

The two API calls for fetching a sale with details is a **valid and intentional design pattern**. It follows database normalization, service separation, and provides flexibility for independent CRUD operations. The current implementation is efficient for typical use cases and should not be considered a problem unless specific performance issues are observed.

## Related Files

- Frontend: `pos-app/src/contexts/SalesContext.jsx`
- Backend: `POSWebApi/Controllers/SalesMasterController.cs`
- Services: `POSWebApi/Services/SalesMaster/` and `POSWebApi/Services/SalesDetail/`
