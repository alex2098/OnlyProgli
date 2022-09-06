using System.ComponentModel.DataAnnotations;

namespace Project2.Entity
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(32)]
        public string Nickname { get; set; }
        [EmailAddress]
        [MaxLength(254)]
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
