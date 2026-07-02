using HospitalMS.Domain.Entities;

namespace HospitalMS.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
