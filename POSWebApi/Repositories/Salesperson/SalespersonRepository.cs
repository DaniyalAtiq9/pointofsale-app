using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;
using POSWebApi.Repositories.Salesperson.Interface;
namespace POSWebApi.Repositories.Salesperson;


public class SalespersonRepository : ISalespersonRepository
{
    private readonly string _connectionString;

    public SalespersonRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    public async Task<int> CreateAsync(SalespersonCreateRequest request)
    {
        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand("sp_CreateSalesperson", conn);
        
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@Name", request.Name ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Code", request.Code ?? (object)DBNull.Value);
        
        await conn.OpenAsync();
        
        var result = await cmd.ExecuteScalarAsync();
        
        return result == null ? 500 : Convert.ToInt32(result);
    }

    public async Task<SalespersonResponse> GetByIdAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand("sp_GetSalespersonById", conn);
        
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SalespersonId", id);
        
        await conn.OpenAsync();
        
        using var reader = await cmd.ExecuteReaderAsync();
        
        if (!await reader.ReadAsync())
            return null;
            
        return new SalespersonResponse
        {
            SalespersonId = reader.GetInt32(reader.GetOrdinal("SalespersonId")),
            Name = reader["Name"].ToString(),
            Code = reader["Code"].ToString(),
            EnteredDate = reader.GetDateTime(reader.GetOrdinal("EnteredDate"))
        };
    }

    public async Task<List<SalespersonResponse>> GetAllAsync()
    {
        var salespersons = new List<SalespersonResponse>();
        
        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand("sp_GetAllSalespersons", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        
        await conn.OpenAsync();
        
        using var reader = await cmd.ExecuteReaderAsync();
        
        while (await reader.ReadAsync())
        {
            salespersons.Add(new SalespersonResponse
            {
                SalespersonId = reader.GetInt32(reader.GetOrdinal("SalespersonId")),
                Name = reader["Name"].ToString(),
                Code = reader["Code"].ToString(),
                EnteredDate = reader.GetDateTime(reader.GetOrdinal("EnteredDate"))
            });
        }
        
        return salespersons;
    }

    public async Task<int> UpdateAsync(int id, SalespersonUpdateData data)
    {
        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand("sp_UpdateSalesperson", conn);
        
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SalespersonId", id);
        cmd.Parameters.AddWithValue("@Name", data.Name ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@Code", data.Code ?? (object)DBNull.Value);
        
        await conn.OpenAsync();
        
        var result = await cmd.ExecuteScalarAsync();
        
        return result == null ? 500 : Convert.ToInt32(result);
    }

    public async Task<int> DeleteAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand("sp_DeleteSalesperson", conn);
        
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@SalespersonId", id);
        
        await conn.OpenAsync();
        
        var result = await cmd.ExecuteScalarAsync();
        
        return Convert.ToInt32(result);
    }
}