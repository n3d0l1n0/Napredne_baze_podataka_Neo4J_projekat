using System;
using System.Collections.Generic;

namespace StudentMentorAPI
{
    public class Mentor
    {
        public string? Id { get; set; }
        public string? Ime { get; set; }
        public string? Prezime { get; set; }
        public string? Email { get; set; }
        public int? Rejting { get; set; }
        public MentorTip Tip { get; set; }
    }
}