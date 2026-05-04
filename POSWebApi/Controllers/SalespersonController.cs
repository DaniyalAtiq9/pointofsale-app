using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using POSWebApi.DTOs.Request;
using POSWebApi.Services.Salesperson.Interface;

[ApiController]
[Route("api/[controller]")]
public class SalespersonController : ControllerBase
{
    private readonly ISalespersonService _service;

    public SalespersonController(ISalespersonService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SalespersonCreateRequest request)
    {
        var (data, statusCode) = await _service.CreateSalesperson(request);
        return StatusCode(statusCode, data);
    }

    [HttpPost("get")]
    public async Task<IActionResult> GetById([FromBody] SalespersonGetRequest request)
    {
        var (data, statusCode) = await _service.GetById(request);
        return StatusCode(statusCode, data);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var salespersons = await _service.GetAll();
        return Ok(salespersons);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SalespersonUpdateRequest request)
    {
        var (data, statusCode) = await _service.Update(request);
        return StatusCode(statusCode, data);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromBody] SalespersonDeleteRequest request)
    {
        var (data, statusCode) = await _service.Delete(request);
        return StatusCode(statusCode, data);
    }
}