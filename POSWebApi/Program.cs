using POSWebApi.Repositories.Product.Interface;
using POSWebApi.Services.Product.Interface;
using POSWebApi.Repositories.Salesperson.Interface;
using POSWebApi.Services.Salesperson.Interface;
using POSWebApi.Repositories.SalesMaster.Interface;
using POSWebApi.Services.SalesMaster.Interface;
using POSWebApi.Repositories.SalesDetail.Interface;
using POSWebApi.Services.SalesDetail.Interface;
using POSWebApi.Repositories.Product;
using POSWebApi.Services.Product;
using POSWebApi.Repositories.Salesperson;
using POSWebApi.Services.Salesperson;
using POSWebApi.Repositories.SalesMaster;
using POSWebApi.Services.SalesMaster;
using POSWebApi.Repositories.SalesDetail;
using POSWebApi.Services.SalesDetail;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

builder.Services.AddScoped<ISalespersonRepository, SalespersonRepository>();
builder.Services.AddScoped<ISalespersonService, SalespersonService>();

builder.Services.AddScoped<ISalesMasterRepository, SalesMasterRepository>();
builder.Services.AddScoped<ISalesMasterService, SalesMasterService>();

builder.Services.AddScoped<ISalesDetailRepository, SalesDetailRepository>();
builder.Services.AddScoped<ISalesDetailService, SalesDetailService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();