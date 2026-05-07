namespace POSWebApi.DTOs.Request;

public class SalesDetailCreateRequest
{
    public int SaleId { get; set; }  // Parent sale identifier
    public int ProductId { get; set; }
    public decimal RetailPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Discount { get; set; }
}

public class SalesDetailGetRequest
{
    public int SaleId { get; set; }  // Parent sale identifier (for filtering)
    public int SaleDetailId { get; set; }
}

public class SalesDetailGetBySaleRequest
{
    public int SaleId { get; set; }  // Parent sale identifier
}

public class SalesDetailUpdateRequest
{
    public int SaleId { get; set; }  // Parent sale identifier (for validation)
    public int SaleDetailId { get; set; }  // Used to identify which detail to update
    public SalesDetailUpdateData Data { get; set; }  // Actual update data
}

public class SalesDetailUpdateData
{
    public int ProductId { get; set; }
    public decimal RetailPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Discount { get; set; }
}

public class SalesDetailDeleteRequest
{
    public int SaleId { get; set; }  // Parent sale identifier (for validation)
    public int SaleDetailId { get; set; }
}

public class SalesDetailBatchUpdateRequest
{
    public int SaleId { get; set; }  // Parent sale identifier
    public List<SalesDetailBatchUpdateItem> Details { get; set; }
}

public class SalesDetailBatchUpdateItem
{
    public int SaleDetailId { get; set; }
    public int ProductId { get; set; }
    public decimal RetailPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Discount { get; set; }
}

public class SalesDetailBatchCreateRequest
{
    public int SaleId { get; set; }
    public List<SalesDetailBatchCreateItem> Details { get; set; }
}

public class SalesDetailBatchCreateItem
{
    public int ProductId { get; set; }
    public decimal RetailPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Discount { get; set; }
}
