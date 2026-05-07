-- ============================================================
-- SALESPERSON
-- ============================================================

-- Get All Salespersons
CREATE OR ALTER PROCEDURE sp_GetAllSalespersons
AS
BEGIN
    SELECT SalespersonId, Name, Code, EnteredDate
    FROM Salesperson;
END
GO

-- Get Salesperson by Id
CREATE OR ALTER PROCEDURE sp_GetSalespersonById
    @SalespersonId INT
AS
BEGIN
    SELECT SalespersonId, Name, Code, EnteredDate
    FROM Salesperson
    WHERE SalespersonId = @SalespersonId;
END
GO

-- Create Salesperson
CREATE OR ALTER PROCEDURE sp_CreateSalesperson
    @Name NVARCHAR(100),
    @Code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Salesperson WHERE Name = @Name)
    BEGIN
        SELECT -2 AS SalespersonId;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Salesperson WHERE Code = @Code)
    BEGIN
        SELECT -3 AS SalespersonId;
        RETURN;
    END

    INSERT INTO Salesperson (Name, Code, EnteredDate)
    VALUES (@Name, @Code, GETDATE());

    SELECT SCOPE_IDENTITY() AS SalespersonId;
END
GO

-- Update Salesperson
CREATE OR ALTER PROCEDURE sp_UpdateSalesperson
    @SalespersonId INT,
    @Name          NVARCHAR(100),
    @Code          NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Salesperson WHERE SalespersonId = @SalespersonId)
    BEGIN
        SELECT 0 AS Result;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Salesperson WHERE Name = @Name AND SalespersonId != @SalespersonId)
    BEGIN
        SELECT -2 AS Result;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Salesperson WHERE Code = @Code AND SalespersonId != @SalespersonId)
    BEGIN
        SELECT -3 AS Result;
        RETURN;
    END

    UPDATE Salesperson
    SET Name = @Name,
        Code = @Code
    WHERE SalespersonId = @SalespersonId;

    SELECT 1 AS Result;
END
GO

-- Delete Salesperson
CREATE OR ALTER PROCEDURE sp_DeleteSalesperson
    @SalespersonId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM SalesMaster WHERE SalespersonId = @SalespersonId)
    BEGIN
        SELECT -1 AS Result;
        RETURN;
    END

    DELETE FROM Salesperson WHERE SalespersonId = @SalespersonId;
    SELECT 1 AS Result;
END
GO
