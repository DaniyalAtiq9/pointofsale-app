namespace POSWebApi.DTOs.Request;

public class ProductCreateRequest
{
    public string Name { get; set; }
    public string Code { get; set; }
    public decimal CostPrice { get; set; }
    public decimal RetailPrice { get; set; }
}

public class ProductGetRequest
{
    public int ProductId { get; set; }
}

public class ProductUpdateRequest
{
    public int ProductId { get; set; }  // Used to identify which product to update
    public ProductUpdateData Data { get; set; }  // Actual update data
}

public class ProductUpdateData
{
    public string Name { get; set; }
    public string Code { get; set; }
    public decimal CostPrice { get; set; }
    public decimal RetailPrice { get; set; }
}

public class ProductDeleteRequest
{
    public int ProductId { get; set; }
}
