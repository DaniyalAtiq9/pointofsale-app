-- ============================================================
-- SALES DETAIL
-- ============================================================
-- Get Sales Detail by Id
CREATE OR ALTER PROCEDURE sp_GetSalesDetailById
    @SaleDetailId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT SaleDetailId, SaleId, ProductId, RetailPrice, Quantity, Discount
    FROM SalesDetail
    WHERE SaleDetailId = @SaleDetailId;
END
GO

-- Get Sales Detail by Sale Id
CREATE OR ALTER PROCEDURE sp_GetSalesDetailBySaleId
    @SaleId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT SaleDetailId, SaleId, ProductId, RetailPrice, Quantity, Discount
    FROM SalesDetail
    WHERE SaleId = @SaleId;
END
GO

-- Create Sales Detail
CREATE OR ALTER PROCEDURE sp_CreateSalesDetail
    @SaleId      INT,
    @ProductId   INT,
    @RetailPrice DECIMAL(18,2),
    @Quantity    INT,
    @Discount    DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Quantity <= 0
    BEGIN
        SELECT -1 AS Result;
        RETURN;
    END

    INSERT INTO SalesDetail (SaleId, ProductId, RetailPrice, Quantity, Discount)
    VALUES (@SaleId, @ProductId, @RetailPrice, @Quantity, @Discount);

    SELECT SCOPE_IDENTITY() AS SalesDetailId;
END
GO

-- Update Sales Detail
CREATE OR ALTER PROCEDURE sp_UpdateSalesDetail
    @SaleDetailId INT,
    @ProductId    INT,
    @RetailPrice  DECIMAL(18,2),
    @Quantity     INT,
    @Discount     DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM SalesDetail WHERE SaleDetailId = @SaleDetailId)
    BEGIN
        SELECT 0 AS Result;
        RETURN;
    END

    IF @Quantity <= 0 OR @Quantity > 999999
    BEGIN
        SELECT -1 AS Result;
        RETURN;
    END

    IF @RetailPrice < 0 OR @Discount < 0
    BEGIN
        SELECT -1 AS Result;
        RETURN;
    END

    UPDATE SalesDetail
    SET ProductId   = @ProductId,
        RetailPrice = @RetailPrice,
        Quantity    = @Quantity,
        Discount    = @Discount
    WHERE SaleDetailId = @SaleDetailId;

    SELECT 1 AS Result;
END
GO

-- Delete Sales Detail
CREATE OR ALTER PROCEDURE sp_DeleteSalesDetail
    @SaleDetailId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM SalesDetail WHERE SaleDetailId = @SaleDetailId)
    BEGIN
        SELECT 0 AS Result;
        RETURN;
    END

    DELETE FROM SalesDetail WHERE SaleDetailId = @SaleDetailId;
    SELECT 1 AS Result;
END
GO
