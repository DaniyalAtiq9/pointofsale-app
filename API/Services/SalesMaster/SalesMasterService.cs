using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;
using POSWebApi.Repositories.SalesMaster.Interface;
using POSWebApi.Services.SalesMaster.Interface;

namespace POSWebApi.Services.SalesMaster;

public class SalesMasterService : ISalesMasterService
{
    private readonly ISalesMasterRepository _repo;

    public SalesMasterService(ISalesMasterRepository repo)
    {
        _repo = repo;
    }

    public async Task<(CreateResponse data, int statusCode)> CreateSale(SalesMasterCreateRequest request)
    {
        // Business logic validation
        if (request.Total < 0)
            return (null, 400);

        // Call repository
        var saleId = await _repo.CreateAsync(request);

        // Return success response
        return (new CreateResponse { Id = saleId }, 201);
    }

    public async Task<(SalesMasterResponse data, int statusCode)> GetById(SalesMasterGetRequest request)
    {
        var sale = await _repo.GetByIdAsync(request.SaleId);

        if (sale == null)
            return (null, 404);

        return (sale, 200);
    }

    public async Task<List<SalesMasterResponse>> GetAll()
    {
        return await _repo.GetAllAsync();
    }

    
    public async Task<(SalesMasterResponse data, int statusCode)> Update(SalesMasterUpdateRequest request)
    {
        Console.WriteLine($"[Service] Starting Update for SaleId: {request.SaleId}");
        
        // Verify sale exists
        var existingSale = await _repo.GetByIdAsync(request.SaleId);
        if (existingSale == null)
        {
            Console.WriteLine($"[Service] Sale {request.SaleId} not found");
            return (null, 404);
        }
        
        Console.WriteLine($"[Service] Existing sale found: {existingSale.SaleId}");

        // Use the consolidated update method if details are provided
        int result;
        if (request.Details != null && request.Details.Count > 0)
        {
            Console.WriteLine($"[Service] Validating {request.Details.Count} details");
            
            // Validate all details before calling repository
            foreach (var item in request.Details)
            {
                if (item.Quantity <= 0 || item.Quantity > 999999 || item.RetailPrice < 0 || item.Discount < 0)
                {
                    Console.WriteLine($"[Service] Validation failed for detail: SaleDetailId={item.SaleDetailId}, Qty={item.Quantity}, Price={item.RetailPrice}, Discount={item.Discount}");
                    return (null, 400); // Invalid data
                }
            }

            Console.WriteLine($"[Service] Calling UpdateWithDetailsAsync");
            // Call the consolidated update method
            result = await _repo.UpdateWithDetailsAsync(request.SaleId, request.Data, request.Details);
        }
        else
        {
            Console.WriteLine($"[Service] No details provided, calling standard UpdateAsync");
            // Call the standard update method (no details)
            result = await _repo.UpdateAsync(request.SaleId, request.Data);
        }
        
        Console.WriteLine($"[Service] Repository returned: {result}");
        
        if (result == 0)
        {
            Console.WriteLine($"[Service] Result is 0, returning 404");
            return (null, 404);
        }

        if (result == -1)
        {
            Console.WriteLine($"[Service] Result is -1, returning 400");
            return (null, 400);
        }

        Console.WriteLine($"[Service] Fetching updated sale");
        var updatedSale = await _repo.GetByIdAsync(request.SaleId);
        
        if (updatedSale == null)
        {
            Console.WriteLine($"[Service] ERROR: Updated sale is null!");
            return (null, 500); // Internal error - update succeeded but can't fetch result
        }
        
        Console.WriteLine($"[Service] Successfully fetched updated sale, returning 200");
        return (updatedSale, 200);
    }

    public async Task<(object data, int statusCode)> Delete(SalesMasterDeleteRequest request)
    {
        var deleted = await _repo.DeleteAsync(request.SaleId);
        
        if (deleted == -1)
        {
            return (new { message = "Dependent records exist" }, 400);
        }
        
        return (new { message = "Sale deleted successfully" }, 200);
    }
}