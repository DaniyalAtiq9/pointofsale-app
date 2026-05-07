using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;
using POSWebApi.Repositories.SalesMaster.Interface;

namespace POSWebApi.Repositories.SalesMaster;

public class SalesMasterRepository : ISalesMasterRepository
{
    private readonly string _connectionString;

    public SalesMasterRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    public async Task<int> CreateAsync(SalesMasterCreateRequest request)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_CreateSalesMaster", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@Total", request.Total);
        cmd.Parameters.AddWithValue("@SalespersonId", request.SalespersonId);
        cmd.Parameters.AddWithValue("@Comments", request.Comments ?? (object)DBNull.Value);
        await conn.OpenAsync();
        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }

    public async Task<SalesMasterResponse> GetByIdAsync(int id)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_GetSalesMasterById", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SaleId", id);
        await conn.OpenAsync();
        using SqlDataReader reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new SalesMasterResponse
            {
                SaleId = (int)reader["SaleId"],
                Total = (decimal)reader["Total"],
                SaleDate = (DateTime)reader["SaleDate"],
                EditDate = reader["EditDate"] == DBNull.Value ? null : (DateTime?)reader["EditDate"],
                SalespersonId = (int)reader["SalespersonId"],
                Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString()
            };
        }
        return null;
    }

    public async Task<List<SalesMasterResponse>> GetAllAsync()
    {
        List<SalesMasterResponse> sales = new();
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_GetAllSalesMaster", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        await conn.OpenAsync();
        using SqlDataReader reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            sales.Add(new SalesMasterResponse
            {
                SaleId = (int)reader["SaleId"],
                Total = (decimal)reader["Total"],
                SaleDate = (DateTime)reader["SaleDate"],
                EditDate = reader["EditDate"] == DBNull.Value ? null : (DateTime?)reader["EditDate"],
                SalespersonId = (int)reader["SalespersonId"],
                Comments = reader["Comments"] == DBNull.Value ? null : reader["Comments"].ToString()
            });
        }
        return sales;
    }

    public async Task<int> UpdateAsync(int id, SalesMasterUpdateData data)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_UpdateSalesMaster", conn);
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.AddWithValue("@SaleId", id);
        cmd.Parameters.AddWithValue("@Total", data.Total);
        cmd.Parameters.AddWithValue("@SalespersonId", data.SalespersonId);
        cmd.Parameters.AddWithValue("@Comments", data.Comments ?? (object)DBNull.Value);

        await conn.OpenAsync();
        var result = Convert.ToInt32(await cmd.ExecuteScalarAsync());
        Console.WriteLine($"SP returned: {result}");

        return result;
    }

    public async Task<int> UpdateWithDetailsAsync(int id, SalesMasterUpdateData data, List<SalesMasterUpdateDetailItem> details)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_UpdateSalesMasterWithDetails", conn);
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.Parameters.AddWithValue("@SaleId", id);
        cmd.Parameters.AddWithValue("@Total", data.Total);
        cmd.Parameters.AddWithValue("@SalespersonId", data.SalespersonId);
        cmd.Parameters.AddWithValue("@Comments", data.Comments ?? (object)DBNull.Value);

        // Serialize details to JSON
        string detailsJson = null;
        if (details != null && details.Count > 0)
        {
            detailsJson = System.Text.Json.JsonSerializer.Serialize(details, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
            });
        }
        cmd.Parameters.AddWithValue("@DetailsJson", detailsJson ?? (object)DBNull.Value);

        await conn.OpenAsync();
        var result = Convert.ToInt32(await cmd.ExecuteScalarAsync());
        Console.WriteLine($"SP returned: {result}");

        return result;
    }

    public async Task<int> DeleteAsync(int id)
    {
        using SqlConnection conn = new(_connectionString);
        using SqlCommand cmd = new("sp_DeleteSalesMaster", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SaleId", id);
        await conn.OpenAsync();
        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }
}