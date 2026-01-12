using System;
using System.Collections.Generic;

namespace StudentMentorAPI.Models
{
    public class Student
    {
        public string? id { get; set; }
        public string? ime { get; set; }
        public string? prezime { get; set; }
        public string? email { get; set; }
        public string? smer { get; set; }
        public int godinaStudija { get; set; }
    }
}
