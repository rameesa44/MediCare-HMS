using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.Auth;
using HospitalMS.Application.Interfaces;
using HospitalMS.Domain.Interfaces;
using HospitalMS.Domain.Entities;
using HospitalMS.Domain.Enums;
using HospitalMS.Domain.Exceptions;

namespace HospitalMS.Api.Controllers;

[ApiVersion("1.0")]
public class AuthController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;

    public AuthController(IUnitOfWork unitOfWork, ITokenService tokenService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    /// <summary>Login with email and password.</summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
    {
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new BadRequestException("Invalid email or password.");

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshTokenValue = _tokenService.GenerateRefreshToken();

        var tokenRecord = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            JwtToken = accessToken,
            TokenValue = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedBy = user.Email,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.RefreshTokens.AddAsync(tokenRecord);
        await _unitOfWork.SaveChangesAsync();

        var userDto = _mapper.Map<UserDto>(user);

        return OkResponse(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = userDto
        }, "Login successful.");
    }

    /// <summary>Self-registration for new patients.</summary>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Register([FromBody] RegisterRequest request)
    {
        var exists = await _unitOfWork.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (exists)
            throw new ConflictException("Email address is already registered.");

        var user = _mapper.Map<User>(request);
        user.Id = Guid.NewGuid();
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        user.Role = UserRole.Patient;
        user.CreatedBy = "SelfRegistration";
        user.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.AddAsync(user);

        var patient = new Patient
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PatientNumber = "P-" + new Random().Next(10000, 99999).ToString(),
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "SelfRegistration"
        };
        await _unitOfWork.Patients.AddAsync(patient);
        await _unitOfWork.SaveChangesAsync();

        return CreatedResponse(_mapper.Map<UserDto>(user), "Registration successful.");
    }

    /// <summary>Refresh JWT access token using a valid refresh token.</summary>
    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var tokenRecord = await _unitOfWork.RefreshTokens.FirstOrDefaultAsync(t =>
            t.TokenValue == request.RefreshToken &&
            t.JwtToken == request.AccessToken);

        if (tokenRecord == null || tokenRecord.IsRevoked || tokenRecord.IsExpired)
            throw new ForbiddenException("Invalid or expired refresh token.");

        var user = await _unitOfWork.Users.GetByIdAsync(tokenRecord.UserId);
        if (user == null)
            throw new NotFoundException("User not found.");

        // Revoke current token
        tokenRecord.IsRevoked = true;
        tokenRecord.RevokedAt = DateTime.UtcNow;
        tokenRecord.RevokedBy = user.Email;

        // Issue new tokens
        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshValue = _tokenService.GenerateRefreshToken();

        await _unitOfWork.RefreshTokens.AddAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            JwtToken = newAccessToken,
            TokenValue = newRefreshValue,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedBy = user.Email,
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.SaveChangesAsync();

        return OkResponse(new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshValue,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = _mapper.Map<UserDto>(user)
        }, "Token refreshed successfully.");
    }
}
