using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;

namespace POSWebApi.Services.SalesDetail.Interface
{
    public interface ISalesDetailService
    {
        Task<(CreateResponse data, int statusCode)> AddDetailToSale(SalesDetailCreateRequest request);
        Task<(SalesDetailResponse data, int statusCode)> GetDetail(SalesDetailGetRequest request);
        Task<List<SalesDetailResponse>> GetDetailsBySale(SalesDetailGetBySaleRequest request);
        Task<(SalesDetailResponse data, int statusCode)> UpdateDetail(SalesDetailUpdateRequest request);
        Task<(object data, int statusCode)> RemoveDetail(SalesDetailDeleteRequest request);
        Task<(object data, int statusCode)> BatchUpdateDetails(SalesDetailBatchUpdateRequest request);
        Task<(object data, int statusCode)> BatchCreateDetails(SalesDetailBatchCreateRequest request);
    }
}