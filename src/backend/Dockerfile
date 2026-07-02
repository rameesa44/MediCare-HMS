# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy csproj files and restore dependencies
COPY src/HospitalMS.Domain/HospitalMS.Domain.csproj src/HospitalMS.Domain/
COPY src/HospitalMS.Application/HospitalMS.Application.csproj src/HospitalMS.Application/
COPY src/HospitalMS.Infrastructure/HospitalMS.Infrastructure.csproj src/HospitalMS.Infrastructure/
COPY src/HospitalMS.Api/HospitalMS.Api.csproj src/HospitalMS.Api/
RUN dotnet restore src/HospitalMS.Api/HospitalMS.Api.csproj

# Copy the remaining files and build the app
COPY . .
RUN dotnet publish src/HospitalMS.Api/HospitalMS.Api.csproj -c Release -o out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

# Exposure and entry point
EXPOSE 8080
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENTRYPOINT ["dotnet", "HospitalMS.Api.dll"]
