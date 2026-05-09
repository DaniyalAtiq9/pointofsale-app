-- ============================================================
-- SALES MASTER
-- ============================================================

-- Get All Sales Master

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
    ORDER BY ISNULL(EditDate, SaleDate) DESC;
END
GO


-- Get Sales Master by Id
CREATE OR ALTER PROCEDURE sp_GetSalesMasterById
    @SaleId INT
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
    WHERE SaleId = @SaleId;
END
GO


-- Create Sales Master
CREATE OR ALTER PROCEDURE sp_CreateSalesMaster
    @Total         DECIMAL(18,2),
    @SalespersonId INT,
    @Comments      NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO SalesMaster
    (
        Total,
        SaleDate,
        EditDate,
        SalespersonId,
        Comments
    )
    VALUES
    (
        @Total,
        GETDATE(),
        GETDATE(),
        @SalespersonId,
        @Comments
    );

    SELECT SCOPE_IDENTITY() AS SaleId;
END
GO


-- Update Sales Master (header only)
CREATE OR ALTER PROCEDURE sp_UpdateSalesMaster
    @SaleId        INT,
    @Total         DECIMAL(18,2),
    @SalespersonId INT,
    @Comments      NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM SalesMaster
        WHERE SaleId = @SaleId
    )
    BEGIN
        SELECT 0 AS Result;
        RETURN;
    END

    UPDATE SalesMaster
    SET
        Total         = @Total,
        SalespersonId = @SalespersonId,
        Comments      = @Comments,
        EditDate      = GETDATE()
    WHERE SaleId = @SaleId;

    SELECT 1 AS Result;
END
GO


-- Update Sales Master with Details (consolidated / atomic)
CREATE OR ALTER PROCEDURE sp_UpdateSalesMasterWithDetails
    @SaleId        INT,
    @Total         DECIMAL(18,2),
    @SalespersonId INT,
    @Comments      NVARCHAR(500) = NULL,
    @DetailsJson   NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;

    BEGIN TRY

        IF NOT EXISTS
        (
            SELECT 1
            FROM SalesMaster
            WHERE SaleId = @SaleId
        )
        BEGIN
            SELECT 0 AS Result;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE SalesMaster
        SET
            Total         = @Total,
            SalespersonId = @SalespersonId,
            Comments      = @Comments,
            EditDate      = GETDATE()
        WHERE SaleId = @SaleId;

        IF @DetailsJson IS NOT NULL
           AND @DetailsJson <> ''
        BEGIN

            DECLARE @Details TABLE
            (
                SaleDetailId INT,
                ProductId    INT,
                RetailPrice  DECIMAL(18,2),
                Quantity     INT,
                Discount     DECIMAL(18,2)
            );

            INSERT INTO @Details
            (
                SaleDetailId,
                ProductId,
                RetailPrice,
                Quantity,
                Discount
            )
            SELECT
                SaleDetailId,
                ProductId,
                RetailPrice,
                Quantity,
                Discount
            FROM OPENJSON(@DetailsJson)
            WITH
            (
                SaleDetailId INT           '$.saleDetailId',
                ProductId    INT           '$.productId',
                RetailPrice  DECIMAL(18,2) '$.retailPrice',
                Quantity     INT           '$.quantity',
                Discount     DECIMAL(18,2) '$.discount'
            );

            DECLARE
                @DetailId    INT,
                @ProductId   INT,
                @RetailPrice DECIMAL(18,2),
                @Quantity    INT,
                @Discount    DECIMAL(18,2);

            DECLARE detail_cursor CURSOR FOR
            SELECT
                SaleDetailId,
                ProductId,
                RetailPrice,
                Quantity,
                Discount
            FROM @Details;

            OPEN detail_cursor;

            FETCH NEXT FROM detail_cursor
            INTO
                @DetailId,
                @ProductId,
                @RetailPrice,
                @Quantity,
                @Discount;

            WHILE @@FETCH_STATUS = 0
            BEGIN

                -- Skip invalid rows
                IF @Quantity <= 0
                   OR @Quantity > 999999
                   OR @RetailPrice < 0
                   OR @Discount < 0
                BEGIN
                    FETCH NEXT FROM detail_cursor
                    INTO
                        @DetailId,
                        @ProductId,
                        @RetailPrice,
                        @Quantity,
                        @Discount;

                    CONTINUE;
                END

                -- New Detail
                IF @DetailId < 0
                BEGIN
                    INSERT INTO SalesDetail
                    (
                        SaleId,
                        ProductId,
                        RetailPrice,
                        Quantity,
                        Discount
                    )
                    VALUES
                    (
                        @SaleId,
                        @ProductId,
                        @RetailPrice,
                        @Quantity,
                        @Discount
                    );
                END
                ELSE
                BEGIN
                    UPDATE SalesDetail
                    SET
                        ProductId   = @ProductId,
                        RetailPrice = @RetailPrice,
                        Quantity    = @Quantity,
                        Discount    = @Discount
                    WHERE SaleDetailId = @DetailId
                      AND SaleId       = @SaleId;
                END

                FETCH NEXT FROM detail_cursor
                INTO
                    @DetailId,
                    @ProductId,
                    @RetailPrice,
                    @Quantity,
                    @Discount;
            END

            CLOSE detail_cursor;
            DEALLOCATE detail_cursor;
        END

        COMMIT TRANSACTION;

        SELECT 1 AS Result;

    END TRY

    BEGIN CATCH

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SELECT -1 AS Result;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);

    END CATCH
END
GO


-- Delete Sales Master
CREATE OR ALTER PROCEDURE sp_DeleteSalesMaster
    @SaleId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM SalesDetail
        WHERE SaleId = @SaleId
    )
    BEGIN
        DELETE FROM SalesDetail
        WHERE SaleId = @SaleId;
    END

    DELETE FROM SalesMaster
    WHERE SaleId = @SaleId;

    SELECT 1 AS Result;
END
GO