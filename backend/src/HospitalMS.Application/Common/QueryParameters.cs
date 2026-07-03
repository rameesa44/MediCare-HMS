namespace HospitalMS.Application.Common;

/// <summary>
/// Base query parameters for all list endpoints.
/// Supports pagination, searching, sorting, and filtering.
/// </summary>
public class QueryParameters
{
    private const int MaxPageSize = 100;
    private int _pageSize = 10;

    public int PageNumber { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    /// <summary>
    /// General search term applied across multiple fields.
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Column name to sort by (e.g., "createdAt", "name").
    /// </summary>
    public string? SortBy { get; set; }

    /// <summary>
    /// Sort direction: "asc" or "desc". Default is "desc".
    /// </summary>
    public string SortDirection { get; set; } = "desc";

    public bool IsDescending => SortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
}
