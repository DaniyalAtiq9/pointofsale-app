namespace POSWebApi.DTOs.Response
{
    public class SalesDetailResponse
    {
        public int SaleDetailId { get; set; }
        public int SaleId { get; set; }
        public int ProductId { get; set; }
        public decimal RetailPrice { get; set; }
        public int Quantity { get; set; }
        public decimal Discount { get; set; }
    }
}