using System.Collections.Generic;
using System.Threading.Tasks;
using POSWebApi.DTOs.Request;
using POSWebApi.DTOs.Response;
using POSWebApi.Repositories.SalesDetail.Interface;
using POSWebApi.Repositories.SalesMaster.Interface;
using POSWebApi.Services.SalesDetail.Interface;

namespace POSWebApi.Services.SalesDetail;

public class SalesDetailService : ISalesDetailService
{
    private readonly ISalesDetailRepository _repo;
    private readonly ISalesMasterRepository _salesMasterRepo;

    public SalesDetailService(ISalesDetailRepository repo, ISalesMasterRepository salesMasterRepo)
    {
        _repo = repo;
        _salesMasterRepo = salesMasterRepo;
    }

    public async Task<(CreateResponse data, int statusCode)> AddDetailToSale(SalesDetailCreateRequest request)
    {
        // Business logic validation
        if (request.Quantity <= 0)
            return (null, 400);

        if (request.Quantity > 999999)
            return (null, 400);

        if (request.RetailPrice < 0)
            return (null, 400);

        if (request.Discount < 0)
            return (null, 400);

        // Verify parent SalesMaster exists
        var sale = await _salesMasterRepo.GetByIdAsync(request.SaleId);
        if (sale == null)
            return (null, 404);

        // Call repository
        var detailId = await _repo.CreateAsync(request.SaleId, request);

        // Return success response
        return (new CreateResponse { Id = detailId }, 201);
    }

    public async Task<(SalesDetailResponse data, int statusCode)> GetDetail(SalesDetailGetRequest request)
    {
        var detail = await _repo.GetByIdAsync(request.SaleDetailId);

        if (detail == null)
            return (null, 404);

        // Verify the detail belongs to the specified sale
        if (detail.SaleId != request.SaleId)
            return (null, 404);

        return (detail, 200);
    }

    public async Task<List<SalesDetailResponse>> GetDetailsBySale(SalesDetailGetBySaleRequest request)
    {
        return await _repo.GetBySaleIdAsync(request.SaleId);
    }

    public async Task<(SalesDetailResponse data, int statusCode)> UpdateDetail(SalesDetailUpdateRequest request)
    {
        // First verify the detail belongs to this sale
        var existingDetail = await _repo.GetByIdAsync(request.SaleDetailId);
        if (existingDetail == null || existingDetail.SaleId != request.SaleId)
            return (null, 404);

        var result = await _repo.UpdateAsync(request.SaleDetailId, request.Data);

        if (result == 0)
            return (null, 404);

        if (result == -1)
            return (null, 400);

        var updatedDetail = await _repo.GetByIdAsync(request.SaleDetailId);

        return (updatedDetail, 200);
    }

    public async Task<(object data, int statusCode)> RemoveDetail(SalesDetailDeleteRequest request)
    {
        // First verify the detail belongs to this sale
        var existingDetail = await _repo.GetByIdAsync(request.SaleDetailId);
        if (existingDetail == null || existingDetail.SaleId != request.SaleId)
            return (null, 404);

        var result = await _repo.DeleteAsync(request.SaleDetailId);

        if (result == 0)
            return (new { message = "Detail not found" }, 404);

        return (new { message = "Detail removed successfully" }, 200);
    }

    public async Task<(object data, int statusCode)> BatchUpdateDetails(SalesDetailBatchUpdateRequest request)
    {
        // Verify parent SalesMaster exists
        var sale = await _salesMasterRepo.GetByIdAsync(request.SaleId);
        if (sale == null)
            return (new { message = "Sale not found" }, 404);

        var updatedCount = 0;
        var errors = new List<string>();

        foreach (var item in request.Details)
        {
            // Verify the detail belongs to this sale
            var existingDetail = await _repo.GetByIdAsync(item.SaleDetailId);
            if (existingDetail == null || existingDetail.SaleId != request.SaleId)
            {
                errors.Add($"Detail {item.SaleDetailId} not found or doesn't belong to sale {request.SaleId}");
                continue;
            }

            // Validate data
            if (item.Quantity <= 0 || item.Quantity > 999999 || item.RetailPrice < 0 || item.Discount < 0)
            {
                errors.Add($"Invalid data for detail {item.SaleDetailId}");
                continue;
            }

            // Update the detail
            var updateData = new SalesDetailUpdateData
            {
                ProductId = item.ProductId,
                RetailPrice = item.RetailPrice,
                Quantity = item.Quantity,
                Discount = item.Discount
            };

            var result = await _repo.UpdateAsync(item.SaleDetailId, updateData);
            if (result > 0)
            {
                updatedCount++;
            }
            else
            {
                errors.Add($"Failed to update detail {item.SaleDetailId}");
            }
        }

        if (errors.Count > 0 && updatedCount == 0)
        {
            return (new { message = "Batch update failed", errors }, 400);
        }

        return (new { message = $"Successfully updated {updatedCount} details", updatedCount, errors }, 200);
    }

    public async Task<(object data, int statusCode)> BatchCreateDetails(SalesDetailBatchCreateRequest request)
    {
        // Verify parent SalesMaster exists
        var sale = await _salesMasterRepo.GetByIdAsync(request.SaleId);
        if (sale == null)
            return (new { message = "Sale not found" }, 404);

        var createdCount = 0;
        var errors = new List<string>();

        foreach (var item in request.Details)
        {
            // Validate data
            if (item.Quantity <= 0 || item.Quantity > 999999 || item.RetailPrice < 0 || item.Discount < 0)
            {
                errors.Add($"Invalid data for product {item.ProductId}");
                continue;
            }

            // Create the detail
            var createRequest = new SalesDetailCreateRequest
            {
                SaleId = request.SaleId,
                ProductId = item.ProductId,
                RetailPrice = item.RetailPrice,
                Quantity = item.Quantity,
                Discount = item.Discount
            };

            var detailId = await _repo.CreateAsync(request.SaleId, createRequest);
            if (detailId > 0)
            {
                createdCount++;
            }
            else
            {
                errors.Add($"Failed to create detail for product {item.ProductId}");
            }
        }

        if (errors.Count > 0 && createdCount == 0)
        {
            return (new { message = "Batch create failed", errors }, 400);
        }

        return (new { message = $"Successfully created {createdCount} details", createdCount, errors }, 201);
    }
}