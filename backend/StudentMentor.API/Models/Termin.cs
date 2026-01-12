using System;
using System.Collections.Generic;

namespace StudentMentorAPI
{
    public class Termin
    {
        public string? Id { get; set; }
        public DateTime Datum { get; set; }
        public TimeSpan VremeOd { get; set; }
        public TimeSpan VremeDo { get; set; }
        
    }
}