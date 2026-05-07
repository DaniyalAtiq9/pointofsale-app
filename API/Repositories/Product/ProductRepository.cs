using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using System.Data;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;
using POSWebApi.Repositories.Product.Interface;

namespace POSWebApi.Repositories.Product;

public class ProductRepository : IProductRepository
{
    private readonly string _connectionString;
    public ProductRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    public async Task<int> CreateAsync(ProductCreateRequest request)
    {
        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand("sp_CreateProduct", conn);
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.AddWithValue("@Name", request.Name ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Code", request.Code ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@CostPrice", request.CostPrice);
        cmd.Parameters.AddWithValue("@RetailPrice", request.RetailPrice);

        await conn.OpenAsync();
        var result = await cmd.ExecuteScalarAsync();

        return result == null ? 500 : Convert.ToInt32(result);
    }
    public async Task<ProductResponse> GetByIdAsync(int id)
    {
    using var conn = new SqlConnection(_connectionString);
    using var cmd = new SqlCommand("sp_GetProductById", conn);

    cmd.CommandType = CommandType.StoredProcedure;
    cmd.Parameters.AddWithValue("@ProductId", id);

    await conn.OpenAsync();

    using var reader = await cmd.ExecuteReaderAsync();

    if (!await reader.ReadAsync())
        return null;
    return new ProductResponse
    {
        ProductId = reader.GetInt32(reader.GetOrdinal("ProductId"))
    };
    }

    public async Task<List<ProductResponse>> GetAllAsync()
    {
        var products = new List<ProductResponse>();

        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand("sp_GetAllProducts", conn)
        {
            CommandType = CommandType.StoredProcedure
        };

        await conn.OpenAsync();

        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            products.Add(new ProductResponse
            {
                ProductId = reader.GetInt32(reader.GetOrdinal("ProductId")),
                Name = reader["Name"].ToString(),
                Code = reader["Code"].ToString(),
                CostPrice = reader.GetDecimal(reader.GetOrdinal("CostPrice")),
                RetailPrice = reader.GetDecimal(reader.GetOrdinal("RetailPrice")),
                CreationDate = reader.GetDateTime(reader.GetOrdinal("CreationDate"))
            });
        }

        return products;
    }
    public async Task<int> UpdateAsync(int id, ProductUpdateData data)
    {
        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand("sp_UpdateProduct", conn);
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.AddWithValue("@ProductId", id);
        cmd.Parameters.AddWithValue("@Name", data.Name ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Code", data.Code ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@CostPrice", data.CostPrice);
        cmd.Parameters.AddWithValue("@RetailPrice", data.RetailPrice);

        await conn.OpenAsync();
        var result = await cmd.ExecuteScalarAsync();

        return result == null ? 500 : Convert.ToInt32(result);
    }
    public async Task<int> DeleteAsync(int id)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_DeleteProduct", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@ProductId", id);
        await conn.OpenAsync();
        var result = await cmd.ExecuteScalarAsync();

        return Convert.ToInt32(result);
    }
}