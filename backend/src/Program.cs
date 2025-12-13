using Microsoft.EntityFrameworkCore;
using Serilog;
using Trophy3D.Api.Data;
using Trophy3D.Api.Filters;

var builder = WebApplicationBuilder.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext with in-memory database
builder.Services.AddDbContext<TrophyDbContext>(options =>
    options.UseInMemoryDatabase("TrophyDb"));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Add exception handling filter
builder.Services.AddScoped<GlobalExceptionFilter>();

// Register application services
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<ITrophyService, TrophyService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Add custom exception handling middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthorization();
app.MapControllers();

app.Run();
