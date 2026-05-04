-- =============================================
-- Update Product and Salesperson Stored Procedures
-- Returns integer codes only (messages handled in service layer)
-- All responses return 200 OK status with descriptive messages
-- =============================================

-- =============================================
-- Update Product
-- =============================================
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
    
    -- Check if product exists
    IF NOT EXISTS (SELECT 1 FROM Product WHERE ProductId = @ProductId)
    BEGIN
        SELECT 0 AS Result; -- Not found
        RETURN;
    END
    
    -- Check if Name already exists (excluding current product)
    IF EXISTS (SELECT 1 FROM Product WHERE Name = @Name AND ProductId != @ProductId)
    BEGIN
        SELECT -2 AS Result; -- Name already exists
        RETURN;
    END
    
    -- Check if Code already exists (excluding current product)
    IF EXISTS (SELECT 1 FROM Product WHERE Code = @Code AND ProductId != @ProductId)
    BEGIN
        SELECT -3 AS Result; -- Code already exists
        RETURN;
    END
    
    -- Business rule validation
    IF (@RetailPrice < @CostPrice)
    BEGIN
        SELECT -1 AS Result; -- Invalid pricing
        RETURN;
    END
    
    -- Update
    UPDATE Product
    SET 
        Name = @Name,
        Code = @Code,
        CostPrice = @CostPrice,
        RetailPrice = @RetailPrice
    WHERE ProductId = @ProductId;
    
    SELECT 1 AS Result; -- Success
END
GO

-- =============================================
-- Update Salesperson
-- =============================================
GO
CREATE OR ALTER PROCEDURE sp_UpdateSalesperson
    @SalespersonId INT,
    @Name NVARCHAR(100),
    @Code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if salesperson exists
    IF NOT EXISTS (SELECT 1 FROM Salesperson WHERE SalespersonId = @SalespersonId)
    BEGIN
        SELECT 0 AS Result; -- Not found
        RETURN;
    END
    
    -- Check if Name already exists (excluding current salesperson)
    IF EXISTS (SELECT 1 FROM Salesperson WHERE Name = @Name AND SalespersonId != @SalespersonId)
    BEGIN
        SELECT -2 AS Result; -- Name already exists
        RETURN;
    END
    
    -- Check if Code already exists (excluding current salesperson)
    IF EXISTS (SELECT 1 FROM Salesperson WHERE Code = @Code AND SalespersonId != @SalespersonId)
    BEGIN
        SELECT -3 AS Result; -- Code already exists
        RETURN;
    END
    
    -- Update
    UPDATE Salesperson
    SET 
        Name = @Name,
        Code = @Code
    WHERE SalespersonId = @SalespersonId;
    
    SELECT 1 AS Result; -- Success
END
GO

PRINT 'Stored procedures updated successfully!';
PRINT 'sp_UpdateProduct returns: 1 (success), 0 (not found), -1 (invalid pricing), -2 (name exists), -3 (code exists)';
PRINT 'sp_UpdateSalesperson returns: 1 (success), 0 (not found), -2 (name exists), -3 (code exists)';
PRINT 'All responses return 200 OK with descriptive messages from service layer';
