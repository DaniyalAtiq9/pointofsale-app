using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;

namespace POSWebApi.Repositories.Salesperson.Interface

{
    public interface ISalespersonRepository
    {
        Task<int> CreateAsync(SalespersonCreateRequest request);
        Task<SalespersonResponse> GetByIdAsync(int id);
        Task<List<SalespersonResponse>> GetAllAsync();
        Task<int> UpdateAsync(int id, SalespersonUpdateData data);
        Task<int> DeleteAsync(int id);
    }
}