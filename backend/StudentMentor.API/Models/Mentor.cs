using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace StudentMentorAPI.Models
{
    public class Mentor
    {

        public string? id { get; set; }

        public string? ime { get; set; }

        public string? prezime { get; set; }

        public string? email { get; set; }

        public int? rejting { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public MentorTip tip { get; set; }
        public bool admin { get; set; }
    }
}