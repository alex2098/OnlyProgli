using Microsoft.EntityFrameworkCore;
using Project2.Entity;

namespace Project2.Data
{
    public class OnlyProgliContext : DbContext
    {
        public OnlyProgliContext(DbContextOptions<OnlyProgliContext> options)
            : base(options)
        {
            //Database.EnsureDeleted(); 
            //Database.EnsureCreated();
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Competition> Competitions { get; set; }
        public DbSet<UsersCompetition> UsersCompetitions { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<Solution> Solutions { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Duel> Duels { get; set; }
    }
}
