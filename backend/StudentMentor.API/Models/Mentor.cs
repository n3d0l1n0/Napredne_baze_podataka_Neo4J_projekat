using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace StudentMentorAPI.Models
{
    public class Mentor
{
    [JsonPropertyName("id")]
    public string? id { get; set; }

    [JsonPropertyName("ime")]
    public string? ime { get; set; }

    [JsonPropertyName("prezime")]
    public string? prezime { get; set; }

    [JsonPropertyName("email")]
    public string? email { get; set; }

    [JsonPropertyName("rejting")]
    public int? rejting { get; set; }

    [JsonPropertyName("lozinka")]
    public string? lozinka { get; set; }

    [JsonPropertyName("admin")]
    public bool admin { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    [JsonPropertyName("tip")]
    public MentorTip tip { get; set; }
}
}