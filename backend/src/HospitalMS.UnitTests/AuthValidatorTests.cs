using Xunit;
using FluentValidation.TestHelper;
using HospitalMS.Application.DTOs.Auth;
using HospitalMS.Application.Validators.Auth;
using HospitalMS.Domain.Enums;

namespace HospitalMS.UnitTests;

public class AuthValidatorTests
{
    private readonly RegisterRequestValidator _registerValidator;
    private readonly LoginRequestValidator _loginValidator;

    public AuthValidatorTests()
    {
        _registerValidator = new RegisterRequestValidator();
        _loginValidator = new LoginRequestValidator();
    }

    [Fact]
    public void RegisterValidator_ShouldHaveError_WhenEmailIsInvalid()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "invalid-email",
            FirstName = "John",
            LastName = "Doe",
            Password = "SecurePassword123!",
            ConfirmPassword = "SecurePassword123!",
            DateOfBirth = DateTime.UtcNow.AddYears(-20),
            Gender = Gender.Male
        };

        // Act
        var result = _registerValidator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email)
              .WithErrorMessage("Invalid email format.");
    }

    [Fact]
    public void RegisterValidator_ShouldHaveError_WhenPasswordsDoNotMatch()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "john@example.com",
            FirstName = "John",
            LastName = "Doe",
            Password = "SecurePassword123!",
            ConfirmPassword = "DifferentPassword123!",
            DateOfBirth = DateTime.UtcNow.AddYears(-20),
            Gender = Gender.Male
        };

        // Act
        var result = _registerValidator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ConfirmPassword)
              .WithErrorMessage("Passwords do not match.");
    }

    [Theory]
    [InlineData("short")] // too short
    [InlineData("NoSpecialChar123")] // missing special character
    [InlineData("nosymboloruppercase123")] // missing uppercase and symbol
    [InlineData("NOSYMBOLORLOWERCASE123!")] // missing lowercase
    [InlineData("NoDigitsHere!")] // missing digit
    public void RegisterValidator_ShouldHaveError_WhenPasswordIsWeak(string weakPassword)
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "john@example.com",
            FirstName = "John",
            LastName = "Doe",
            Password = weakPassword,
            ConfirmPassword = weakPassword,
            DateOfBirth = DateTime.UtcNow.AddYears(-20),
            Gender = Gender.Male
        };

        // Act
        var result = _registerValidator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void RegisterValidator_ShouldNotHaveErrors_WhenRequestIsValid()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "john.doe@medicare.com",
            FirstName = "John",
            LastName = "Doe",
            Password = "StrongPassword123!",
            ConfirmPassword = "StrongPassword123!",
            DateOfBirth = DateTime.UtcNow.AddYears(-25),
            Gender = Gender.Male
        };

        // Act
        var result = _registerValidator.TestValidate(request);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void LoginValidator_ShouldHaveErrors_WhenFieldsAreEmpty()
    {
        // Arrange
        var request = new LoginRequest { Email = "", Password = "" };

        // Act
        var result = _loginValidator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}
