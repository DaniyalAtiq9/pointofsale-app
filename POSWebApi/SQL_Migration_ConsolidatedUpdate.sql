-- =============================================
-- MIGRATION SCRIPT: Consolidated Sale Update
-- =============================================
-- This script creates the new stored procedure for consolidated updates
-- and maintains backward compatibility with existing procedures
-- =============================================

USE [YourDatabaseName];  -- Replace with your actual database name
GO

-- =============================================
-- STEP 1: Ensure EditDate column exists
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns 
               WHERE object_id = OBJECT_ID(N'[dbo].[SalesMaster]') 
               AND name = 'EditDate')
BEGIN
    PRINT 'Adding EditDate column to SalesMaster table...';
    ALTER TABLE SalesMaster 
    ADD EditDate DATETIME NULL;
    PRINT 'EditDate column added successfully.';
END
ELSE
BEGIN
    PRINT 'EditDate column already exists.';
END
GO

-- =============================================
-- STEP 2: Create/Update the consolidated update procedure
-- =============================================
PRINT 'Creating sp_UpdateSalesMasterWithDetails...';
GO

CREATE OR ALTER PROCEDURE sp_UpdateSalesMasterWithDetails
    @SaleId INT,
    @Total DECIMAL(18,2),
    @SalespersonId INT,
    @Comments NVARCHAR(500) = NULL,
    @DetailsJson NVARCHAR(MAX) = NULL  -- JSON array of details
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Start transaction for atomicity
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if sale exists
        IF NOT EXISTS (SELECT 1 FROM SalesMaster WHERE SaleId = @SaleId)
        BEGIN
            SELECT 0 AS Result; -- Not found
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Update SalesMaster
        UPDATE SalesMaster
        SET 
            Total = @Total,
            SalespersonId = @SalespersonId,
            Comments = @Comments,
            EditDate = GETDATE()  -- Automatically set to current server time
        WHERE SaleId = @SaleId;
        
        -- If details JSON is provided, process the details
        IF @DetailsJson IS NOT NULL AND @DetailsJson != ''
        BEGIN
            -- Parse JSON into a temp table
            DECLARE @Details TABLE (
                SaleDetailId INT,
                ProductId INT,
                RetailPrice DECIMAL(18,2),
                Quantity INT,
                Discount DECIMAL(18,2)
            );
            
            INSERT INTO @Details (SaleDetailId, ProductId, RetailPrice, Quantity, Discount)
            SELECT 
                SaleDetailId,
                ProductId,
                RetailPrice,
                Quantity,
                Discount
            FROM OPENJSON(@DetailsJson)
            WITH (
                SaleDetailId INT '$.saleDetailId',
                ProductId INT '$.productId',
                RetailPrice DECIMAL(18,2) '$.retailPrice',
                Quantity INT '$.quantity',
                Discount DECIMAL(18,2) '$.discount'
            );
            
            -- Process each detail
            DECLARE @DetailId INT;
            DECLARE @ProductId INT;
            DECLARE @RetailPrice DECIMAL(18,2);
            DECLARE @Quantity INT;
            DECLARE @Discount DECIMAL(18,2);
            
            DECLARE detail_cursor CURSOR FOR
            SELECT SaleDetailId, ProductId, RetailPrice, Quantity, Discount
            FROM @Details;
            
            OPEN detail_cursor;
            FETCH NEXT FROM detail_cursor INTO @DetailId, @ProductId, @RetailPrice, @Quantity, @Discount;
            
            WHILE @@FETCH_STATUS = 0
            BEGIN
                -- Validate business rules
                IF @Quantity <= 0 OR @Quantity > 999999 OR @RetailPrice < 0 OR @Discount < 0
                BEGIN
                    -- Skip invalid details
                    FETCH NEXT FROM detail_cursor INTO @DetailId, @ProductId, @RetailPrice, @Quantity, @Discount;
                    CONTINUE;
                END
                
                -- Negative SaleDetailId means create new, positive means update existing
                IF @DetailId < 0
                BEGIN
                    -- Create new detail
                    INSERT INTO SalesDetail (SaleId, ProductId, RetailPrice, Quantity, Discount)
                    VALUES (@SaleId, @ProductId, @RetailPrice, @Quantity, @Discount);
                END
                ELSE
                BEGIN
                    -- Update existing detail (only if it belongs to this sale)
                    UPDATE SalesDetail
                    SET 
                        ProductId = @ProductId,
                        RetailPrice = @RetailPrice,
                        Quantity = @Quantity,
                        Discount = @Discount
                    WHERE SaleDetailId = @DetailId
                      AND SaleId = @SaleId;  -- Security: ensure detail belongs to this sale
                END
                
                FETCH NEXT FROM detail_cursor INTO @DetailId, @ProductId, @RetailPrice, @Quantity, @Discount;
            END
            
            CLOSE detail_cursor;
            DEALLOCATE detail_cursor;
        END
        
        -- Commit transaction
        COMMIT TRANSACTION;
        
        SELECT 1 AS Result; -- Success
        
    END TRY
    BEGIN CATCH
        -- Rollback on error
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Return error
        SELECT -1 AS Result;
        
        -- Log error details
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        PRINT 'Error in sp_UpdateSalesMasterWithDetails: ' + @ErrorMessage;
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

PRINT 'sp_UpdateSalesMasterWithDetails created successfully.';
GO

-- =============================================
-- STEP 3: Update the standard update procedure (backward compatibility)
-- =============================================
PRINT 'Updating sp_UpdateSalesMaster...';
GO

CREATE OR ALTER PROCEDURE sp_UpdateSalesMaster
    @SaleId INT,
    @Total DECIMAL(18,2),
    @SalespersonId INT,
    @Comments NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if sale exists
    IF NOT EXISTS (SELECT 1 FROM SalesMaster WHERE SaleId = @SaleId)
    BEGIN
        SELECT 0 AS Result; -- Not found
        RETURN;
    END
    
    -- Update
    UPDATE SalesMaster
    SET 
        Total = @Total,
        SalespersonId = @SalespersonId,
        Comments = @Comments,
        EditDate = GETDATE()
    WHERE SaleId = @SaleId;
    
    SELECT 1 AS Result; -- Success
END
GO

PRINT 'sp_UpdateSalesMaster updated successfully.';
GO

-- =============================================
-- STEP 4: Update the detail update procedure (backward compatibility)
-- =============================================
PRINT 'Updating sp_UpdateSalesDetail...';
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
    
    -- Check if detail exists
    IF NOT EXISTS (SELECT 1 FROM SalesDetail WHERE SaleDetailId = @SaleDetailId)
    BEGIN
        SELECT 0 AS Result; -- Not found
        RETURN;
    END
    
    -- Validate business rules
    IF @Quantity <= 0 OR @Quantity > 999999
    BEGIN
        SELECT -1 AS Result; -- Invalid quantity
        RETURN;
    END
    
    IF @RetailPrice < 0 OR @Discount < 0
    BEGIN
        SELECT -1 AS Result; -- Invalid price or discount
        RETURN;
    END
    
    -- Update
    UPDATE SalesDetail
    SET 
        ProductId = @ProductId,
        RetailPrice = @RetailPrice,
        Quantity = @Quantity,
        Discount = @Discount
    WHERE SaleDetailId = @SaleDetailId;
    
    SELECT 1 AS Result; -- Success
END
GO

PRINT 'sp_UpdateSalesDetail updated successfully.';
GO

-- =============================================
-- STEP 5: Update GetAll procedure to sort by EditDate
-- =============================================
PRINT 'Updating sp_GetAllSalesMaster...';
GO

CREATE OR ALTER PROCEDURE sp_GetAllSalesMaster
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        SaleId,
        Total,
        SaleDate,
        EditDate,
        SalespersonId,
        Comments
    FROM SalesMaster
    ORDER BY EditDate DESC;  -- Sort by most recently edited first
END
GO

PRINT 'sp_GetAllSalesMaster updated successfully.';
GO

-- =============================================
-- STEP 6: Verify procedures were created
-- =============================================
PRINT '';
PRINT '==============================================';
PRINT 'MIGRATION COMPLETE';
PRINT '==============================================';
PRINT '';
PRINT 'Verifying stored procedures...';

IF OBJECT_ID('sp_UpdateSalesMasterWithDetails', 'P') IS NOT NULL
    PRINT '✓ sp_UpdateSalesMasterWithDetails exists';
ELSE
    PRINT '✗ sp_UpdateSalesMasterWithDetails NOT FOUND';

IF OBJECT_ID('sp_UpdateSalesMaster', 'P') IS NOT NULL
    PRINT '✓ sp_UpdateSalesMaster exists';
ELSE
    PRINT '✗ sp_UpdateSalesMaster NOT FOUND';

IF OBJECT_ID('sp_UpdateSalesDetail', 'P') IS NOT NULL
    PRINT '✓ sp_UpdateSalesDetail exists';
ELSE
    PRINT '✗ sp_UpdateSalesDetail NOT FOUND';

IF OBJECT_ID('sp_GetAllSalesMaster', 'P') IS NOT NULL
    PRINT '✓ sp_GetAllSalesMaster exists';
ELSE
    PRINT '✗ sp_GetAllSalesMaster NOT FOUND';

PRINT '';
PRINT 'Migration completed successfully!';
PRINT '';

-- =============================================
-- STEP 7: Example usage
-- =============================================
/*
-- Test the consolidated update procedure:

DECLARE @DetailsJson NVARCHAR(MAX) = N'[
    {
        "saleDetailId": 1,
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
]';

EXEC sp_UpdateSalesMasterWithDetails
    @SaleId = 1,
    @Total = 1250.00,
    @SalespersonId = 5,
    @Comments = 'Updated with consolidated procedure',
    @DetailsJson = @DetailsJson;

-- Verify the update:
SELECT * FROM SalesMaster WHERE SaleId = 1;
SELECT * FROM SalesDetail WHERE SaleId = 1;
*/
