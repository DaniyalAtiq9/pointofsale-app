# POS Application

A full-stack Point of Sale system with a React frontend and ASP.NET Core Web API backend, backed by SQL Server.

---

## Tech Stack

**Frontend** — `pos-app/`
- React 19, Vite, Tailwind CSS
- Axios, React Router, React Toastify

**Backend** — `POSWebApi/`
- ASP.NET Core (.NET 9), C#
- Microsoft.Data.SqlClient (raw SQL / stored procedures)
- Swagger / Swashbuckle

**Database**
- SQL Server (any edition)

---

## Project Structure

```
/
├── pos-app/          # React frontend
│   ├── src/
│   │   ├── api/          # Axios client
│   │   ├── contexts/     # React Context (Product, Sales, Salesperson)
│   │   ├── features/     # UI components by domain
│   │   └── pages/        # Page-level components
│   └── .env
│
└── POSWebApi/        # ASP.NET Core backend
    ├── Controllers/      # API endpoints
    ├── Services/         # Business logic
    ├── Repositories/     # Data access (stored procedures)
    ├── DTOs/             # Request / Response models
    └── appsettings.json  # Connection string config
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- SQL Server (Express or higher)
- SQL Server Management Studio (SSMS) or any SQL client

---

## Database Setup

The app uses stored procedures. You need to run the scripts below once against your database before starting the API.

### Step 1 — Create the database

Open SSMS, connect to your server, and create a new database (e.g. `pos`).

### Step 2 — Add the EditDate column

```sql
USE [pos]; -- replace with your database name

IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[SalesMaster]') AND name = 'EditDate'
)
BEGIN
    ALTER TABLE SalesMaster ADD EditDate DATETIME NULL;
END
GO
```

### Step 3 — Create Sales stored procedures

```sql
USE [pos]; -- replace with your database name
GO

CREATE OR ALTER PROCEDURE sp_UpdateSalesMasterWithDetails
    @SaleId INT,
    @Total DECIMAL(18,2),
    @SalespersonId INT,
    @Comments NVARCHAR(500) = NULL,
    @DetailsJson NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM SalesMaster WHERE SaleId = @SaleId)
        BEGIN
            SELECT 0 AS Result;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE SalesMaster
        SET Total = @Total, SalespersonId = @SalespersonId,
            Comments = @Comments, EditDate = GETDATE()
        WHERE SaleId = @SaleId;

        IF @DetailsJson IS NOT NULL AND @DetailsJson != ''
        BEGIN
            DECLARE @Details TABLE (
                SaleDetailId INT, ProductId INT,
                RetailPrice DECIMAL(18,2), Quantity INT, Discount DECIMAL(18,2)
            );

            INSERT INTO @Details (SaleDetailId, ProductId, RetailPrice, Quantity, Discount)
            SELECT SaleDetailId, ProductId, RetailPrice, Quantity, Discount
            FROM OPENJSON(@DetailsJson)
            WITH (
                SaleDetailId INT '$.saleDetailId',
                ProductId INT '$.productId',
                RetailPrice DECIMAL(18,2) '$.retailPrice',
                Quantity INT '$.quantity',
                Discount DECIMAL(18,2) '$.discount'
            );

            DECLARE @DetailId INT, @ProductId INT, @RetailPrice DECIMAL(18,2),
                    @Quantity INT, @Discount DECIMAL(18,2);

            DECLARE detail_cursor CURSOR FOR
            SELECT SaleDetailId, ProductId, RetailPrice, Quantity, Discount FROM @Details;

            OPEN detail_cursor;
            FETCH NEXT FROM detail_cursor INTO @DetailId, @ProductId, @RetailPrice, @Quantity, @Discount;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                IF @Quantity <= 0 OR @Quantity > 999999 OR @RetailPrice < 0 OR @Discount < 0
                BEGIN
                    FETCH NEXT FROM detail_cursor INTO @DetailId, @ProductId, @RetailPrice, @Quantity, @Discount;
                    CONTINUE;
                END

                IF @DetailId < 0
                    INSERT INTO SalesDetail (SaleId, ProductId, RetailPrice, Quantity, Discount)
                    VALUES (@SaleId, @ProductId, @RetailPrice, @Quantity, @Discount);
                ELSE
                    UPDATE SalesDetail
                    SET ProductId = @ProductId, RetailPrice = @RetailPrice,
                        Quantity = @Quantity, Discount = @Discount
                    WHERE SaleDetailId = @DetailId AND SaleId = @SaleId;

                FETCH NEXT FROM detail_cursor INTO @DetailId, @ProductId, @RetailPrice, @Quantity, @Discount;
            END

            CLOSE detail_cursor;
            DEALLOCATE detail_cursor;
        END

        COMMIT TRANSACTION;
        SELECT 1 AS Result;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT -1 AS Result;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateSalesMaster
    @SaleId INT,
    @Total DECIMAL(18,2),
    @SalespersonId INT,
    @Comments NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM SalesMaster WHERE SaleId = @SaleId)
    BEGIN SELECT 0 AS Result; RETURN; END

    UPDATE SalesMaster
    SET Total = @Total, SalespersonId = @SalespersonId,
        Comments = @Comments, EditDate = GETDATE()
    WHERE SaleId = @SaleId;

    SELECT 1 AS Result;
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateSalesDetail
    @SaleDetailId INT,
    @ProductId INT,
    @RetailPrice DECIMAL(18,2),
    @Quantity INT,
    @Discount DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM SalesDetail WHERE SaleDetailId = @SaleDetailId)
    BEGIN SELECT 0 AS Result; RETURN; END

    IF @Quantity <= 0 OR @Quantity > 999999
    BEGIN SELECT -1 AS Result; RETURN; END

    IF @RetailPrice < 0 OR @Discount < 0
    BEGIN SELECT -1 AS Result; RETURN; END

    UPDATE SalesDetail
    SET ProductId = @ProductId, RetailPrice = @RetailPrice,
        Quantity = @Quantity, Discount = @Discount
    WHERE SaleDetailId = @SaleDetailId;

    SELECT 1 AS Result;
END
GO

CREATE OR ALTER PROCEDURE sp_GetAllSalesMaster
AS
BEGIN
    SET NOCOUNT ON;
    SELECT SaleId, Total, SaleDate, EditDate, SalespersonId, Comments
    FROM SalesMaster
    ORDER BY EditDate DESC;
END
GO
```

### Step 4 — Create Product and Salesperson stored procedures

```sql
USE [pos]; -- replace with your database name
GO

CREATE OR ALTER PROCEDURE sp_UpdateProduct
    @ProductId INT,
    @Name NVARCHAR(100),
    @Code NVARCHAR(50),
    @CostPrice DECIMAL(18,2),
    @RetailPrice DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Product WHERE ProductId = @ProductId)
    BEGIN SELECT 0 AS Result; RETURN; END

    IF EXISTS (SELECT 1 FROM Product WHERE Name = @Name AND ProductId != @ProductId)
    BEGIN SELECT -2 AS Result; RETURN; END

    IF EXISTS (SELECT 1 FROM Product WHERE Code = @Code AND ProductId != @ProductId)
    BEGIN SELECT -3 AS Result; RETURN; END

    IF @RetailPrice < @CostPrice
    BEGIN SELECT -1 AS Result; RETURN; END

    UPDATE Product
    SET Name = @Name, Code = @Code, CostPrice = @CostPrice, RetailPrice = @RetailPrice
    WHERE ProductId = @ProductId;

    SELECT 1 AS Result;
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateSalesperson
    @SalespersonId INT,
    @Name NVARCHAR(100),
    @Code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Salesperson WHERE SalespersonId = @SalespersonId)
    BEGIN SELECT 0 AS Result; RETURN; END

    IF EXISTS (SELECT 1 FROM Salesperson WHERE Name = @Name AND SalespersonId != @SalespersonId)
    BEGIN SELECT -2 AS Result; RETURN; END

    IF EXISTS (SELECT 1 FROM Salesperson WHERE Code = @Code AND SalespersonId != @SalespersonId)
    BEGIN SELECT -3 AS Result; RETURN; END

    UPDATE Salesperson
    SET Name = @Name, Code = @Code
    WHERE SalespersonId = @SalespersonId;

    SELECT 1 AS Result;
END
GO
```

---

## Backend Setup

### 1. Configure the connection string

Edit `POSWebApi/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=pos;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

Replace `YOUR_SERVER` with your SQL Server instance name (e.g. `localhost`, `.\SQLEXPRESS`).

### 2. Run the API

```bash
cd POSWebApi
dotnet run
```

The API starts at:
- HTTP: `http://localhost:5101`
- Swagger UI: `http://localhost:5101/swagger`

---

## Frontend Setup

### 1. Configure the API URL

Edit `pos-app/.env`:

```env
VITE_API_BASE_URL=http://localhost:5101/api
```

Make sure the port matches the backend.

### 2. Install dependencies and run

```bash
cd pos-app
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

---

## API Endpoints

### Products — `/api/product`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/product` | Get all products |
| POST | `/api/product` | Create product |
| POST | `/api/product/get` | Get product by ID |
| PUT | `/api/product` | Update product |
| DELETE | `/api/product` | Delete product |

### Salespersons — `/api/salesperson`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/salesperson` | Get all salespersons |
| POST | `/api/salesperson` | Create salesperson |
| POST | `/api/salesperson/get` | Get salesperson by ID |
| PUT | `/api/salesperson` | Update salesperson |
| DELETE | `/api/salesperson` | Delete salesperson |

### Sales — `/api/salesmaster`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/salesmaster` | Get all sales |
| POST | `/api/salesmaster` | Create sale |
| POST | `/api/salesmaster/get` | Get sale by ID |
| PUT | `/api/salesmaster` | Update sale + details (consolidated) |
| DELETE | `/api/salesmaster` | Delete sale |
| POST | `/api/salesmaster/salesdetails` | Add item to sale |
| POST | `/api/salesmaster/salesdetails/list` | Get all items in a sale |
| POST | `/api/salesmaster/salesdetails/get` | Get single item |
| PUT | `/api/salesmaster/salesdetails` | Update single item |
| DELETE | `/api/salesmaster/salesdetails` | Remove item from sale |
| PUT | `/api/salesmaster/salesdetails/batch` | Batch update items |
| POST | `/api/salesmaster/salesdetails/batch` | Batch create items |

---

## Features

- **Products** — create, edit, delete products with cost/retail price validation
- **Salespersons** — manage salesperson records
- **Point of Sale** — build a sale by searching or browsing products, set quantities and discounts
- **Sales Records** — view, edit, and delete past sales; sorted by most recently edited
- **Consolidated update** — editing a sale (master + line items) is a single atomic API call

---

## Notes

- CORS is configured to allow `http://localhost:5173` (Vite default). If you change the frontend port, update `Program.cs` accordingly.
- The `EditDate` column on `SalesMaster` is set automatically by the stored procedure on every update and is used for sorting.
