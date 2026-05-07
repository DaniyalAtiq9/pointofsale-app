using System;
namespace POSWebApi.DTOs.Response
{
    public class SalesMasterResponse
    {
        public int SaleId { get; set; } 
        public decimal Total { get; set; } 
        public DateTime SaleDate { get; set; }
        public DateTime? EditDate { get; set; }
        public int SalespersonId { get; set; } 
        public string Comments { get; set; } 
    }
}