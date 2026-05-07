using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;

namespace POSWebApi.Services.Product.Interface

{
    public interface IProductService
    {
        Task<(CreateResponse data, int statusCode)> CreateProduct(ProductCreateRequest request);
        Task<(ProductResponse data, int statusCode)> GetById(ProductGetRequest request);
        Task<List<ProductResponse>> GetAll();
        Task<(object data, int statusCode)> Update(ProductUpdateRequest request);
        Task<(object data, int statusCode)> Delete(ProductDeleteRequest request);
    }
}