using System;
using System.Collections.Generic;

namespace StudentMentorAPI.Models
{
    public class Termin
    {
        public string? Id { get; set; }
        public DateTime Datum { get; set; }
        public TimeSpan VremeOd { get; set; }
        public TimeSpan VremeDo { get; set; }
        
    }
}