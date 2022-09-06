using Microsoft.EntityFrameworkCore;
using Project2.Data;
using Project2.Entity;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Project2.Service
{
    public class CheckAccessService
    {
        private readonly JWTAuthService _jwt;
        private readonly OnlyProgliContext _context;

        public CheckAccessService(JWTAuthService jwt, OnlyProgliContext context)
        {
            _jwt = jwt;
            _context = context;
        }

        public async Task<Competition> CheckAuthor(int id, string token)
        {
            int user_id = _jwt.GetId(token);
            var user = await _context.Users.FindAsync(user_id);
            if (user == null)
            {
                return null;
            }

            var competition = await _context.Competitions.FindAsync(id);
            if (competition == null)
            {
                return null;
            }
            if (competition.UserId != user.Id)
            {
                return null;
            }

            return competition;
        }

        public async Task<Boolean> CheckParticipantByTask(int id, string token)
        {
            int user_id = _jwt.GetId(token);
            var user = await _context.Users.FindAsync(user_id);
            if (user == null)
            {
                return false;
            }

            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return false;
            }

            var competition = await _context.Competitions.FindAsync(task.CompetitionId);
            var check_competition = await _context.UsersCompetitions
                .Where(u => (u.UserId == user.Id &&
                    u.CompetitionId == competition.Id))
                .FirstOrDefaultAsync();
            if (check_competition == null && competition.UserId != user.Id)
            {
                return false;
            }
            return true;
        }

        public async Task<Boolean> CheckParticipantByCompetition(int id, string token)
        {
            int user_id = _jwt.GetId(token);
            var user = await _context.Users.FindAsync(user_id);
            if (user == null)
            {
                return false;
            }

            var competition = await _context.Competitions.FindAsync(id);
            var check_competition = await _context.UsersCompetitions
                .Where(u => (u.UserId == user.Id &&
                    u.CompetitionId == competition.Id))
                .FirstOrDefaultAsync();
            if (check_competition == null && competition.UserId != user.Id)
            {
                return false;
            }
            return true;
        }
    }
}
