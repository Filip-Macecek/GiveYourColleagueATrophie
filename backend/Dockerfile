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
FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

# Install curl for container health checks
RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /app/build .

# Expose port
EXPOSE 5000

# Run the application
ENTRYPOINT ["dotnet", "Trophy3D.Api.dll"]
