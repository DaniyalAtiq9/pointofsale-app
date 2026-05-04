using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;

namespace POSWebApi.Repositories.SalesDetail.Interface
{
    public interface ISalesDetailRepository
    {
        Task<int> CreateAsync(int saleId, SalesDetailCreateRequest request);
        Task<SalesDetailResponse> GetByIdAsync(int detailId);
        Task<List<SalesDetailResponse>> GetBySaleIdAsync(int saleId);
        Task<int> UpdateAsync(int detailId, SalesDetailUpdateData data);
        Task<int> DeleteAsync(int detailId);
    }
}