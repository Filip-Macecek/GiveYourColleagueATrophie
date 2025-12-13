# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

WORKDIR /src

# Copy project file
COPY backend/backend.csproj .

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY backend/src ./src

# Build the application
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM mcr.microsoft.com/dotnet/runtime:8.0

WORKDIR /app

# Copy built application
COPY --from=builder /app/build .

# Expose port
EXPOSE 5000

# Run the application
ENTRYPOINT ["dotnet", "Trophy3D.Api.dll"]
