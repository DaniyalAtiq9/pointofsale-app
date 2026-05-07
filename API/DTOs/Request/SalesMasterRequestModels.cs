using System.ComponentModel.DataAnnotations;

namespace POSWebApi.DTOs.Request;

public class SalesMasterCreateRequest
{
    public decimal Total { get; set; }
    public int SalespersonId { get; set; }
    public string Comments { get; set; }
}

public class SalesMasterGetRequest
{
    public int SaleId { get; set; }
}

public class SalesMasterUpdateRequest
{
    [Required]
    public int SaleId { get; set; }  // Used to identify which sale to update
    
    [Required]
    public SalesMasterUpdateData Data { get; set; }  // Actual update data
    
    public List<SalesMasterUpdateDetailItem>? Details { get; set; }  // Sale details to update/create (optional)
}

public class SalesMasterUpdateData
{
    [Required]
    public decimal Total { get; set; }
    
    [Required]
    public int SalespersonId { get; set; }
    
    public string? Comments { get; set; }
}

public class SalesMasterUpdateDetailItem
{
    [Required]
    public int SaleDetailId { get; set; }  // Positive = update existing, Negative = create new
    
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    public decimal RetailPrice { get; set; }
    
    [Required]
    public int Quantity { get; set; }
    
    [Required]
    public decimal Discount { get; set; }
}

public class SalesMasterDeleteRequest
{
    public int SaleId { get; set; }
}
