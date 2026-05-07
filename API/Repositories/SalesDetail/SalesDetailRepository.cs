using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;
using POSWebApi.Repositories.SalesDetail.Interface;

namespace POSWebApi.Repositories.SalesDetail;

public class SalesDetailRepository : ISalesDetailRepository
{
    private readonly string _connectionString;

    public SalesDetailRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    public async Task<int> CreateAsync(int saleId, SalesDetailCreateRequest request)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_CreateSalesDetail", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SaleId", saleId);
        cmd.Parameters.AddWithValue("@ProductId", request.ProductId);
        cmd.Parameters.AddWithValue("@RetailPrice", request.RetailPrice);
        cmd.Parameters.AddWithValue("@Quantity", request.Quantity);
        cmd.Parameters.AddWithValue("@Discount", request.Discount);
        await conn.OpenAsync();
        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }

    public async Task<SalesDetailResponse> GetByIdAsync(int detailId)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_GetSalesDetailById", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SaleDetailId", detailId);
        await conn.OpenAsync();
        using SqlDataReader reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new SalesDetailResponse
            {
                SaleDetailId = (int)reader["SaleDetailId"],
                SaleId = (int)reader["SaleId"],
                ProductId = (int)reader["ProductId"],
                RetailPrice = (decimal)reader["RetailPrice"],
                Quantity = (int)reader["Quantity"],
                Discount = (decimal)reader["Discount"]
            };
        }
        return null;
    }

    public async Task<List<SalesDetailResponse>> GetBySaleIdAsync(int saleId)
    {
        List<SalesDetailResponse> details = new();
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_GetSalesDetailBySaleId", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SaleId", saleId);
        await conn.OpenAsync();
        using SqlDataReader reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            details.Add(new SalesDetailResponse
            {
                SaleDetailId = (int)reader["SaleDetailId"],
                SaleId = (int)reader["SaleId"],
                ProductId = (int)reader["ProductId"],
                RetailPrice = (decimal)reader["RetailPrice"],
                Quantity = (int)reader["Quantity"],
                Discount = (decimal)reader["Discount"]
            });
        }
        return details;
    }

    public async Task<int> UpdateAsync(int detailId, SalesDetailUpdateData data)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_UpdateSalesDetail", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SaleDetailId", detailId);
        cmd.Parameters.AddWithValue("@ProductId", data.ProductId);
        cmd.Parameters.AddWithValue("@RetailPrice", data.RetailPrice);
        cmd.Parameters.AddWithValue("@Quantity", data.Quantity);
        cmd.Parameters.AddWithValue("@Discount", data.Discount);
        await conn.OpenAsync();
        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }

    public async Task<int> DeleteAsync(int detailId)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_DeleteSalesDetail", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SaleDetailId", detailId);
        await conn.OpenAsync();
        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }
}