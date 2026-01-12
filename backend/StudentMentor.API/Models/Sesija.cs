using System;
using System.Collections.Generic;

namespace StudentMentorAPI.Models
{
    public class Sesija
    {
        public string? id { get; set; }
        public string? opis { get; set; }
        public string? status { get; set; }
        public int? ocena { get; set; }
    }
}