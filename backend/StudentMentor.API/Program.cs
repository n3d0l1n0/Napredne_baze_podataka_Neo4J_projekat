using DotNetEnv;
using StudentMentorAPI;
using StudentMentorAPI.Services;

Env.Load();
var builder = WebApplication.CreateBuilder(args);

//servisi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<Neo4jService>();
builder.Services.AddSingleton(Neo4jConfiguration.Local);

//cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();


app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Neo4J API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.MapControllers();
app.Run();