using System;

namespace POSWebApi.DTOs.Response;

public class SalespersonResponse
{
    public int SalespersonId { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public DateTime EnteredDate { get; set; }
}