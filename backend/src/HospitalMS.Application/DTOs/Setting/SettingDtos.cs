namespace HospitalMS.Application.DTOs.Setting;

public class HospitalSettingDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
}

public class UpdateHospitalSettingsRequest
{
    public string HospitalName { get; set; } = "MediCare Hospital";
    public string ContactEmail { get; set; } = "contact@medicare.com";
    public string ContactPhone { get; set; } = "555-0199";
    public string Address { get; set; } = "123 Health Ave, Boston, MA";
    public string CurrencySymbol { get; set; } = "$";
    public string DefaultConsultationFee { get; set; } = "150.00";
}
