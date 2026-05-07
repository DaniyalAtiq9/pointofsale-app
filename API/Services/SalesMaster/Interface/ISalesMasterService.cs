using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;

namespace POSWebApi.Services.SalesMaster.Interface
{
    public interface ISalesMasterService
    {
        Task<(CreateResponse data, int statusCode)> CreateSale(SalesMasterCreateRequest request);
        Task<(SalesMasterResponse data, int statusCode)> GetById(SalesMasterGetRequest request);
        Task<List<SalesMasterResponse>> GetAll();
        Task<(SalesMasterResponse data, int statusCode)> Update(SalesMasterUpdateRequest request);
        Task<(object data, int statusCode)> Delete(SalesMasterDeleteRequest request);
    }
}