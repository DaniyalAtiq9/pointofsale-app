using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;
using POSWebApi.Repositories.Product.Interface;
using POSWebApi.Services.Product.Interface;

namespace POSWebApi.Services.Product;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;

    public ProductService(IProductRepository repo)
    {
        _repo = repo;
    }
    public async Task<(CreateResponse data, int statusCode)> CreateProduct(ProductCreateRequest request)
    {
        var productId = await _repo.CreateAsync(request);

        if (productId == -3 || productId == -2) return (null, 409); // Name or Code already exists
        if (productId == -1) return (null, 400); // Invalid pricing
        if (productId > 0) return (new CreateResponse { Id = productId }, 201); // Success

        return (null, 500);
    }

    public async Task<(ProductResponse data, int statusCode)> GetById(ProductGetRequest request)
    {
        var product = await _repo.GetByIdAsync(request.ProductId);

        if (product == null)
            return (null, 404);

        return (product, 200);
    }

    public async Task<List<ProductResponse>> GetAll()
    {
        return await _repo.GetAllAsync();
    }

    public async Task<(object data, int statusCode)> Update(ProductUpdateRequest request)
    {
        var result = await _repo.UpdateAsync(request.ProductId, request.Data);

        // Map result codes to messages - always return 200 OK
        if (result == -3) 
            return (new { message = "Product code already exists" }, 200);
        
        if (result == -2) 
            return (new { message = "Product name already exists" }, 200);
        
        if (result == -1) 
            return (new { message = "Retail price cannot be less than cost price" }, 200);
        
        if (result == 0) 
            return (new { message = "Product not found" }, 200);
        
        if (result == 1)
        {
            var updatedProduct = await _repo.GetByIdAsync(request.ProductId);
            return (new { message = "Product updated successfully", product = updatedProduct }, 200);
        }

        return (new { message = "Unknown error occurred" }, 200);
    }
    public async Task<(object data, int statusCode)> Delete(ProductDeleteRequest request)
    {
        var deleted = await _repo.DeleteAsync(request.ProductId);
        if (deleted == -1)
        {
            return (new { message = "Dependent records exist" },400 );
        }
        return (new { message = "Product deleted successfully" }, 200);
      
    }
}
