using System;

namespace Project2.Models
{
    public class CompetitionModel
    {
        public DateTime BeginDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Boolean Open { get; set; }
        public string Password { get; set; }
    }
}
