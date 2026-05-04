using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;

namespace POSWebApi.Repositories.SalesMaster.Interface
{
    public interface ISalesMasterRepository
    {
        Task<int> CreateAsync(SalesMasterCreateRequest request);
        Task<SalesMasterResponse> GetByIdAsync(int id);
        Task<List<SalesMasterResponse>> GetAllAsync();
        Task<int> UpdateAsync(int id, SalesMasterUpdateData data);
        Task<int> UpdateWithDetailsAsync(int id, SalesMasterUpdateData data, List<SalesMasterUpdateDetailItem> details);
        Task<int> DeleteAsync(int id);
    }
}