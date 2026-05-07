using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;
using POSWebApi.Repositories.Salesperson.Interface;
using POSWebApi.Services.Salesperson.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace POSWebApi.Services.Salesperson;

public class SalespersonService : ISalespersonService
{
    private readonly ISalespersonRepository _repo;

    public SalespersonService(ISalespersonRepository repo)
    {
        _repo = repo;
    }

    public async Task<(CreateResponse data, int statusCode)> CreateSalesperson(SalespersonCreateRequest request)
    {
        var salespersonId = await _repo.CreateAsync(request);

        if (salespersonId == -3 || salespersonId == -2) return (null, 409); // Name or Code already exists
        if (salespersonId == -1) return (null, 400); // Invalid data
        if (salespersonId > 0) return (new CreateResponse { Id = salespersonId }, 201); // Success

        return (null, 500);
    }

    public async Task<(SalespersonResponse data, int statusCode)> GetById(SalespersonGetRequest request)
    {
        var salesperson = await _repo.GetByIdAsync(request.SalespersonId);

        if (salesperson == null)
            return (null, 404);

        return (salesperson, 200);
    }

    public async Task<List<SalespersonResponse>> GetAll()
    {
        return await _repo.GetAllAsync();
    }

    public async Task<(object data, int statusCode)> Update(SalespersonUpdateRequest request)
    {
        var result = await _repo.UpdateAsync(request.SalespersonId, request.Data);

        // Map result codes to messages - always return 200 OK
        if (result == -3) 
            return (new { message = "Salesperson code already exists" }, 200);
        
        if (result == -2) 
            return (new { message = "Salesperson name already exists" }, 200);
        
        if (result == 0) 
            return (new { message = "Salesperson not found" }, 200);
        
        if (result == 1)
        {
            var updatedSalesperson = await _repo.GetByIdAsync(request.SalespersonId);
            return (new { message = "Salesperson updated successfully", salesperson = updatedSalesperson }, 200);
        }

        return (new { message = "Unknown error occurred" }, 200);
    }

    public async Task<(object data, int statusCode)> Delete(SalespersonDeleteRequest request)
    {
        var deleted = await _repo.DeleteAsync(request.SalespersonId);

        if (deleted == -1)
        {
            return (new { message = "Dependent records exist" }, 400);
        }

        return (new { message = "Salesperson deleted successfully" }, 200);
    }
}