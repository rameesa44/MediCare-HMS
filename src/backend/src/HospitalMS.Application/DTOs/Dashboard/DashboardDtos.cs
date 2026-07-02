namespace HospitalMS.Application.DTOs.Dashboard;

/// <summary>
/// Admin dashboard statistics summary.
/// </summary>
public class DashboardStatsDto
{
    public int TotalPatients { get; set; }
    public int TotalDoctors { get; set; }
    public int TotalAppointments { get; set; }
    public int TodayAppointments { get; set; }
    public int ActiveAdmissions { get; set; }
    public int AvailableBeds { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public int PendingBills { get; set; }
    public int NewPatientsThisMonth { get; set; }

    // Trends
    public List<ChartDataPoint> MonthlyRevenueChart { get; set; } = [];
    public List<ChartDataPoint> PatientGrowthChart { get; set; } = [];
    public List<ChartDataPoint> AppointmentsByDepartment { get; set; } = [];
    public List<RecentActivityDto> RecentActivities { get; set; } = [];
}

public class ChartDataPoint
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class RecentActivityDto
{
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? UserName { get; set; }
}
