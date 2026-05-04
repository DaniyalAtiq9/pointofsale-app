using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;

namespace POSWebApi.Repositories.Product.Interface

{
    public interface IProductRepository
    {
        Task<int> CreateAsync(ProductCreateRequest request);
        Task<ProductResponse> GetByIdAsync(int id);
        Task<List<ProductResponse>> GetAllAsync();
        Task<int> UpdateAsync(int id, ProductUpdateData data);
        Task<int> DeleteAsync(int id);
    }
}