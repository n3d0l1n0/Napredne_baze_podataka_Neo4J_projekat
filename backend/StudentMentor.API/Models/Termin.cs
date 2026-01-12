using System;
using System.Collections.Generic;

namespace StudentMentorAPI.Models
{
    public class Termin
    {
        public string? id { get; set; }
        public DateTime datum { get; set; }
        public DateTime vremeOd { get; set; }
        public DateTime vremeDo { get; set; }
        
    }
}