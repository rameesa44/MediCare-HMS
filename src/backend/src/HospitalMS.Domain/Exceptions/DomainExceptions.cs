namespace HospitalMS.Domain.Exceptions;

/// <summary>
/// Base exception for domain-level validation and business rule violations.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
    public DomainException(string message, Exception innerException) : base(message, innerException) { }
}

/// <summary>
/// Thrown when a requested entity is not found in the database.
/// Maps to HTTP 404 Not Found.
/// </summary>
public class NotFoundException : DomainException
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} with ID '{key}' was not found.") { }
    
    public NotFoundException(string message)
        : base(message) { }
}

/// <summary>
/// Thrown when a user attempts an action they don't have permission for.
/// Maps to HTTP 403 Forbidden.
/// </summary>
public class ForbiddenException : DomainException
{
    public ForbiddenException(string message = "You do not have permission to perform this action.")
        : base(message) { }
}

/// <summary>
/// Thrown when a request contains invalid or conflicting data.
/// Maps to HTTP 400 Bad Request.
/// </summary>
public class BadRequestException : DomainException
{
    public IDictionary<string, string[]>? Errors { get; }

    public BadRequestException(string message) : base(message) { }

    public BadRequestException(string message, IDictionary<string, string[]> errors)
        : base(message)
    {
        Errors = errors;
    }
}

/// <summary>
/// Thrown when a conflict occurs (e.g., duplicate email, double-booking).
/// Maps to HTTP 409 Conflict.
/// </summary>
public class ConflictException : DomainException
{
    public ConflictException(string message) : base(message) { }
}
