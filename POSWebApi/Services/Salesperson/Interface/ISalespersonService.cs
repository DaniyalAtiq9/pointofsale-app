using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;

namespace POSWebApi.Services.Salesperson.Interface
{
    public interface ISalespersonService
    {
        Task<(CreateResponse data, int statusCode)> CreateSalesperson(SalespersonCreateRequest request);
        Task<(SalespersonResponse data, int statusCode)> GetById(SalespersonGetRequest request);
        Task<List<SalespersonResponse>> GetAll();
        Task<(object data, int statusCode)> Update(SalespersonUpdateRequest request);
        Task<(object data, int statusCode)> Delete(SalespersonDeleteRequest request);
    }
}