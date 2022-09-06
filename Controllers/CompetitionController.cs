using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project2.Data;
using Project2.Entity;
using Project2.Models;
using Project2.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Project2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CompetitionController : Controller
    {
        private readonly OnlyProgliContext _context;
        private readonly JWTAuthService _jwt;
        private readonly CheckAccessService _check;

        public CompetitionController(OnlyProgliContext context,
                                JWTAuthService jwt,
                                CheckAccessService check)
        {
            _context = context;
            _jwt = jwt;
            _check = check;
        }

        private List<Competition> GetCompetition(List<Competition> competition, int min, int max, string name, long begin, long end)
        {
            if (name != "name=")
            {
                var new_name = name.Remove(0, 5);
                competition = competition
                    .Where(s => s.Name.Contains(new_name))
                    .ToList();
            }
            DateTime begin_date = new();
            if (begin != 0)
            {
                begin_date = new DateTime(1970, 1, 1);
                begin_date = begin_date.AddMilliseconds(begin);
                competition = competition
                    .Where(s => (s.EndDate > begin_date))
                    .ToList();
            }
            if (end != 0)
            {
                DateTime end_date = new DateTime(1970, 1, 1);
                end_date = end_date.AddMilliseconds(end);
                competition = competition
                    .Where(s => (s.BeginDate < end_date))
                    .ToList();
            }

            int count = competition.Count;
            if (count >= (max - min))
            {
                competition = competition.GetRange(min, max);
            }
            return competition;
        }

        [HttpPost("add")]
        public async Task<ActionResult> Add([Bind("BeginDate", "EndDate", "Name", "Description", "Open", "Password")] Competition add)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var check_name = await _context.Competitions
                .AsNoTracking()
                .Where(u => u.Name == add.Name)
                .FirstOrDefaultAsync();

            if (check_name != null)
            {
                return BadRequest();
            }

            var competition = new Competition
            {
                Name = add.Name,
                Description = add.Description,
                BeginDate = add.BeginDate,
                EndDate = add.EndDate,
                Open = add.Open,
                Password = add.Password,
                UserId = user.Id
            };
            await _context.Competitions.AddAsync(competition);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("get/{id}")]
        public async Task<ActionResult> GetSettings(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            var competition = await _check.CheckAuthor(id, auth_header);
            if(competition == null)
            {
                return NotFound();
            }

            var user_competition = await (
                from c in _context.UsersCompetitions
                join u in _context.Users
                on c.UserId equals u.Id 
                where c.CompetitionId == id
                select new { u.Id, u.Nickname }).ToListAsync();

            return Ok(Json(new {Competition = competition, 
                users = user_competition.ToArray()}));
        }
       

        [HttpPut("update/{id}")]
        public async Task<ActionResult> Update(int id, UpdateCompetitionModel update)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            var competition = await _check.CheckAuthor(id, auth_header);
            if (competition == null)
            {
                return NotFound();
            }

            if (competition.Name != update.Competition.Name)
            {
                var check_name = await _context.Competitions
                  .AsNoTracking()
                  .Where(u => u.Name == update.Competition.Name)
                  .FirstOrDefaultAsync();

                if (check_name != null)
                {
                    return BadRequest();
                }
            }
            competition.Name = update.Competition.Name;
            competition.Description = update.Competition.Description;
            competition.BeginDate = update.Competition.BeginDate;
            competition.EndDate = update.Competition.EndDate;
            competition.Open = update.Competition.Open;
            competition.Password = update.Competition.Password;

            var user_competition = await _context.UsersCompetitions
                .Where(u => (update.Users.Contains(u.UserId) && u.CompetitionId == id))
                .ToListAsync();

            _context.UsersCompetitions.RemoveRange(user_competition);

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            var competition = await _check.CheckAuthor(id, auth_header);
            if (competition == null)
            {
                return NotFound();
            }

            var task = await _context.Tasks
                .Where(u => u.CompetitionId == competition.Id)
                .ToListAsync();

            List<Solution> solution = new();
            List<Duel> duel = new();
            foreach(var items in task)
            {
                solution.AddRange(await _context.Solutions
                    .Where(s => s.TaskId == items.Id)
                    .ToListAsync());
            }
            foreach(var items in solution)
            {
                duel.AddRange(await _context.Duels
                    .Where(s => s.SolutionId_1 == items.Id)
                    .ToListAsync());
                duel.AddRange(await _context.Duels
                    .Where(s => s.SolutionId_2 == items.Id)
                    .ToListAsync());
            }

            _context.Duels.RemoveRange(duel);
            _context.Solutions.RemoveRange(solution);
            _context.Tasks.RemoveRange(task);
            _context.Competitions.Remove(competition);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("getlist/{min}&{max}&{name}&{begin}&{end}")]
        public async Task<ActionResult> GetCompetitions(int min, int max, string name, long begin, long end)
        {
            if (min >= max || max < 0 || min < 0)
            {
                return BadRequest();
            }

            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int user_id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(user_id);

            if (user == null)
            {
                return NotFound();
            }

            var user_competition = await _context.UsersCompetitions
                .Where(s => s.UserId == user.Id)
                .Select(s => s.CompetitionId)
                .ToListAsync();

            var competition = await _context.Competitions
                .Where(s => (s.UserId != user.Id && 
                    !user_competition.Contains(s.Id) &&
                    s.EndDate > DateTime.UtcNow))
                .ToListAsync();

            competition = GetCompetition(competition, min, max, name, begin, end);
            int count = competition.Count;
            Boolean forward = (count > (max - min));

            return Ok(Json(new { competitions = competition, 
                forward = forward }));
        }

        [HttpPost("add/user/{id}")]
        public async Task<ActionResult> AddUserCompetition(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int user_id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(user_id);

            if (user == null)
            {
                return NotFound();
            }

            UsersCompetition user_competition = new UsersCompetition
            {
                UserId = user.Id,
                CompetitionId = id
            };

            await _context.UsersCompetitions.AddAsync(user_competition);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("getlist/user/{min}&{max}&{name}&{begin}&{end}")]
        public async Task<ActionResult> GetUserCompetitions(int min, int max, string name, long begin, long end)
        {
            if (min >= max || max < 0 || min < 0)
            {
                return BadRequest();
            }

            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int user_id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(user_id);

            if (user == null)
            {
                return NotFound();
            }

            var user_competition = await _context.UsersCompetitions
                .Where(s => s.UserId == user.Id)
                .Select(s => s.CompetitionId)
                .ToListAsync();

            var competition = await _context.Competitions
                .Where(s => (s.UserId == user.Id ||
                    user_competition.Contains(s.Id)))
                .ToListAsync();

            competition = GetCompetition(competition, min, max, name, begin, end);
            int count = competition.Count;
            Boolean forward = (count > (max - min));

            return Ok(Json(new { competitions = competition, 
                forward = forward, user = user.Id }));
        }

        [HttpDelete("delete/user/{id}")]
        public async Task<ActionResult> DeleteUserCompetition(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int user_id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(user_id);

            if (user == null)
            {
                return NotFound();
            }

            var user_competition = await _context.UsersCompetitions
                .Where(s => (s.CompetitionId == id && s.UserId == user.Id))
                .FirstOrDefaultAsync();

             _context.UsersCompetitions.Remove(user_competition);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
