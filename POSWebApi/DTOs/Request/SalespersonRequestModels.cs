namespace POSWebApi.DTOs.Request;

public class SalespersonCreateRequest
{
    public string Name { get; set; }
    public string Code { get; set; }
}

public class SalespersonGetRequest
{
    public int SalespersonId { get; set; }
}

public class SalespersonUpdateRequest
{
    public int SalespersonId { get; set; }  // Used to identify which salesperson to update
    public SalespersonUpdateData Data { get; set; }  // Actual update data
}

public class SalespersonUpdateData
{
    public string Name { get; set; }
    public string Code { get; set; }
}

public class SalespersonDeleteRequest
{
    public int SalespersonId { get; set; }
}
