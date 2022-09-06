using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project2.Entity
{
    public class Duel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public Boolean Win_1 { get; set; }
        [Required]
        public Boolean Win_2 { get; set; }
        [Required]
        public int SolutionId_1 { get; set; }
        [ForeignKey("SolutionId_1")]
        public Solution Solution_1 { get; set; }
        [Required]
        public int SolutionId_2 { get; set; }
        [ForeignKey("SolutionId_2")]
        public Solution Solution_2 { get; set; }

    }
}
