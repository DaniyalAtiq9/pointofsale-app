using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using POSWebApi.DTOs.Request;
using POSWebApi.Services.Product.Interface;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IProductService _service;

    public ProductController(IProductService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductCreateRequest request)
    {
        var (data, statusCode) = await _service.CreateProduct(request);
        return StatusCode(statusCode, data);
    }

    [HttpPost("get")]
    public async Task<IActionResult> GetById([FromBody] ProductGetRequest request)
    {
        var (data, statusCode) = await _service.GetById(request);
        return StatusCode(statusCode, data);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _service.GetAll();
        return Ok(products);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ProductUpdateRequest request)
    {
        var (data, statusCode) = await _service.Update(request);
        return StatusCode(statusCode, data);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromBody] ProductDeleteRequest request)
    {
        var (data, statusCode) = await _service.Delete(request);
        return StatusCode(statusCode, data);
    }
}