-- ============================================================
-- PRODUCT
-- ============================================================

-- Get All Products
CREATE OR ALTER PROCEDURE sp_GetAllProducts
AS
BEGIN
    SELECT
        ProductId,
        Name,
        Code,
        CostPrice,
        RetailPrice,
        CreationDate
    FROM Product;
END
GO

-- Get Product by Id
CREATE OR ALTER PROCEDURE sp_GetProductById
    @ProductId INT
AS
BEGIN
    SELECT
        ProductId,
        Name,
        Code,
        CostPrice,
        RetailPrice,
        CreationDate
    FROM Product
    WHERE ProductId = @ProductId;
END
GO

-- Create Product
CREATE OR ALTER PROCEDURE sp_CreateProduct
    @Name       NVARCHAR(100),
    @Code       NVARCHAR(50),
    @CostPrice  DECIMAL(18,2),
    @RetailPrice DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Product WHERE Name = @Name)
    BEGIN
        SELECT -2 AS ProductId;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Product WHERE Code = @Code)
    BEGIN
        SELECT -3 AS ProductId;
        RETURN;
    END

    IF (@RetailPrice < @CostPrice)
    BEGIN
        SELECT -1 AS ProductId;
        RETURN;
    END

    INSERT INTO Product (Name, Code, CostPrice, RetailPrice)
    VALUES (@Name, @Code, @CostPrice, @RetailPrice);

    SELECT SCOPE_IDENTITY() AS ProductId;
END
GO

-- Update Product
CREATE OR ALTER PROCEDURE sp_UpdateProduct
    @ProductId   INT,
    @Name        NVARCHAR(100),
    @Code        NVARCHAR(50),
    @CostPrice   DECIMAL(18,2),
    @RetailPrice DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Product WHERE ProductId = @ProductId)
    BEGIN
        SELECT 0 AS Result;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Product WHERE Name = @Name AND ProductId != @ProductId)
    BEGIN
        SELECT -2 AS Result;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Product WHERE Code = @Code AND ProductId != @ProductId)
    BEGIN
        SELECT -3 AS Result;
        RETURN;
    END

    IF (@RetailPrice < @CostPrice)
    BEGIN
        SELECT -1 AS Result;
        RETURN;
    END

    UPDATE Product
    SET Name        = @Name,
        Code        = @Code,
        CostPrice   = @CostPrice,
        RetailPrice = @RetailPrice
    WHERE ProductId = @ProductId;

    SELECT 1 AS Result;
END
GO

-- Delete Product
CREATE OR ALTER PROCEDURE sp_DeleteProduct
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM SalesDetail WHERE ProductId = @ProductId)
    BEGIN
        SELECT -1 AS Result;
        RETURN;
    END

    DELETE FROM Product WHERE ProductId = @ProductId;
    SELECT 1 AS Result;
END
GO
