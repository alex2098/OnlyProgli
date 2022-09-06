using System;

namespace Project2.Models
{
    public class TaskModel
    {
        public DateTime BeginDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Matrix { get; set; }
        public int CompetitionId { get; set; }
    }
}
