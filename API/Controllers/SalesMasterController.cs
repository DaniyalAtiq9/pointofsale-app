using Microsoft.AspNetCore.Mvc;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;
using POSWebApi.Services.SalesMaster.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.Services.SalesDetail.Interface;

namespace POSWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesMasterController : ControllerBase
{
    private readonly ISalesMasterService _service;
    private readonly ISalesDetailService _detailService;

    public SalesMasterController(ISalesMasterService service, ISalesDetailService detailService)
    {
        _service = service;
        _detailService = detailService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SalesMasterCreateRequest request)
    {
        var (data, statusCode) = await _service.CreateSale(request);
        return StatusCode(statusCode, data);
    }

    [HttpPost("get")]
    public async Task<IActionResult> GetById([FromBody] SalesMasterGetRequest request)
    {
        var (data, statusCode) = await _service.GetById(request);
        return StatusCode(statusCode, data);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sales = await _service.GetAll();
        return Ok(sales);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SalesMasterUpdateRequest request)
    {
        // Check model state
        if (!ModelState.IsValid)
        {
            Console.WriteLine("Model validation failed:");
            foreach (var error in ModelState)
            {
                Console.WriteLine($"  Key: {error.Key}");
                foreach (var err in error.Value.Errors)
                {
                    Console.WriteLine($"    Error: {err.ErrorMessage}");
                    if (err.Exception != null)
                    {
                        Console.WriteLine($"    Exception: {err.Exception.Message}");
                    }
                }
            }
            return BadRequest(ModelState);
        }
        
        // Log the incoming request for debugging
        Console.WriteLine($"Received Update Request:");
        Console.WriteLine($"  SaleId: {request?.SaleId}");
        Console.WriteLine($"  Data: {request?.Data != null}");
        Console.WriteLine($"  Details Count: {request?.Details?.Count ?? 0}");
        
        if (request?.Details != null)
        {
            for (int i = 0; i < request.Details.Count; i++)
            {
                var detail = request.Details[i];
                Console.WriteLine($"  Detail[{i}]: SaleDetailId={detail.SaleDetailId}, ProductId={detail.ProductId}");
            }
        }
        
        var (data, statusCode) = await _service.Update(request);
        return StatusCode(statusCode, data);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromBody] SalesMasterDeleteRequest request)
    {
        var (data, statusCode) = await _service.Delete(request);
        return StatusCode(statusCode, data);
    }


    //-------------------------------------- SALES DETAIL METHODS ------------------------------------//

    // Add item to a sale
    [HttpPost("salesdetails")]
    public async Task<IActionResult> AddItemToSale([FromBody] SalesDetailCreateRequest request)
    {
        var (data, statusCode) = await _detailService.AddDetailToSale(request);
        return StatusCode(statusCode, data);
    }

    // View all items in a sale
    [HttpPost("salesdetails/list")]
    public async Task<IActionResult> GetSaleItems([FromBody] SalesDetailGetBySaleRequest request)
    {
        var details = await _detailService.GetDetailsBySale(request);
        return Ok(details);
    }

    // View a specific item in a sale
    [HttpPost("salesdetails/get")]
    public async Task<IActionResult> GetSaleItem([FromBody] SalesDetailGetRequest request)
    {
        var (data, statusCode) = await _detailService.GetDetail(request);
        return StatusCode(statusCode, data);
    }

    // Update item quantity or discount
    [HttpPut("salesdetails")]
    public async Task<IActionResult> UpdateSaleItem([FromBody] SalesDetailUpdateRequest request)
    {
        var (data, statusCode) = await _detailService.UpdateDetail(request);
        return StatusCode(statusCode, data);
    }

    // Remove item from sale
    [HttpDelete("salesdetails")]
    public async Task<IActionResult> RemoveItemFromSale([FromBody] SalesDetailDeleteRequest request)
    {
        var (data, statusCode) = await _detailService.RemoveDetail(request);
        return StatusCode(statusCode, data);
    }

    // Batch update sale details
    [HttpPut("salesdetails/batch")]
    public async Task<IActionResult> BatchUpdateSaleDetails([FromBody] SalesDetailBatchUpdateRequest request)
    {
        var (data, statusCode) = await _detailService.BatchUpdateDetails(request);
        return StatusCode(statusCode, data);
    }

    // Batch create sale details
    [HttpPost("salesdetails/batch")]
    public async Task<IActionResult> BatchCreateSaleDetails([FromBody] SalesDetailBatchCreateRequest request)
    {
        var (data, statusCode) = await _detailService.BatchCreateDetails(request);
        return StatusCode(statusCode, data);
    }
}