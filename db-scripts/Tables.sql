

--Create Required Tables

CREATE TABLE Product (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    CostPrice DECIMAL(18,2) NOT NULL,
    RetailPrice DECIMAL(18,2) NOT NULL,
    CreationDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE Salesperson (
    SalespersonID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    EnteredDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE SalesMaster (
    SaleId INT IDENTITY(1,1) PRIMARY KEY,
    Total DECIMAL(18,2) NOT NULL DEFAULT 0,
    SaleDate DATETIME DEFAULT GETDATE(),
    SalespersonId INT NOT NULL,
    Comments NVARCHAR(255),

    CONSTRAINT FK_SalesMaster_Salesperson
    FOREIGN KEY (SalespersonId)
    REFERENCES Salesperson(SalespersonID)
);
ALTER TABLE SalesMaster
ADD EditDate DATETIME NULL;
GO

CREATE TABLE SalesDetail (
    SaleDetailId INT IDENTITY(1,1) PRIMARY KEY,
    SaleId INT NOT NULL,
    ProductId INT NOT NULL,
    RetailPrice DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL,
    Discount DECIMAL(18,2) DEFAULT 0,

    CONSTRAINT FK_SalesDetail_SalesMaster
    FOREIGN KEY (SaleId)
    REFERENCES SalesMaster(SaleId)
    ON DELETE CASCADE,

    CONSTRAINT FK_SalesDetail_Product
    FOREIGN KEY (ProductId)
    REFERENCES Product(ProductId)
    );