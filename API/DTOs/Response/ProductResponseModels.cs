using System;

namespace POSWebApi.DTOs.Response;

public class ProductResponse
{
    public int ProductId { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public decimal CostPrice { get; set; }
    public decimal RetailPrice { get; set; }
    public DateTime CreationDate { get; set; }
}
public class CreateResponse
{
    public int Id { get; set; }
}

