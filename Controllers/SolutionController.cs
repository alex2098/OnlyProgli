using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project2.Data;
using Project2.Entity;
using Project2.Models;
using Project2.Service;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Project2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SolutionController : Controller
    {
        private readonly OnlyProgliContext _context;
        private readonly JWTAuthService _jwt;
        private readonly CheckAccessService _check;
        public SolutionController(OnlyProgliContext context,
                                JWTAuthService jwt,
                                CheckAccessService check)
        {
            _context = context;
            _jwt = jwt;
            _check = check;
        }

        [HttpPost("add")]
        public async Task<ActionResult> Add(SolutionModel add)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int user_id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(user_id);
            if (user == null)
            {
                return NotFound();
            }

            var task  = await _context.Tasks.FindAsync(add.TaskId);
            if (task == null)
            {
                return NotFound();
            }

            var competition = await _context.Competitions.FindAsync(task.CompetitionId);
            var check_competition = await _context.UsersCompetitions
                .Where(u => (u.UserId == user.Id &&
                    u.CompetitionId == competition.Id))
                .FirstOrDefaultAsync();
            if (check_competition == null && competition.UserId != user.Id)
            {
                return NotFound();
            }

            var sol = await _context.Solutions
                .Where(s => (s.TaskId == task.Id && 
                    s.UserId == user.Id))
                .FirstOrDefaultAsync();
            if(sol != null)
            {
                _context.Solutions.Remove(sol);
            }

            var solution = new Solution
            {
                Code = add.Code,
                TaskId = task.Id,
                UserId = user.Id
            };
            await _context.Solutions.AddAsync(solution);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("getlist/{id}")]
        public async Task<ActionResult> GetList(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            if(! await _check.CheckParticipantByTask(id, auth_header))
            {
                return NotFound();
            }

            var task = await _context.Tasks.FindAsync(id);

            var solution = await _context.Solutions
                .Where(s => (s.TaskId == id))
                .Select(s => new {s.Id, s.Code})
                .ToListAsync();

            return Ok(Json(new { Solution = solution, Field = task.Matrix }));
        }

        [HttpGet("getlist/duel/{id}")]
        public async Task<ActionResult> GetListDuels(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            if (!await _check.CheckParticipantByTask(id, auth_header))
            {
                return NotFound();
            }

            var task = await _context.Tasks.FindAsync(id);
            var solution = await _context.Solutions
                .Where(s => (s.TaskId == id))
                .Select(s => s.Id)
                .ToListAsync();
            var duels = await _context.Duels
                .Where(s => (solution.Contains(s.SolutionId_1) ||
                    solution.Contains(s.SolutionId_2)))
                .Select(s => new {Name_1 = s.Solution_1.User.Nickname,
                    Name_2 = s.Solution_2.User.Nickname, 
                    Win_1 = s.Win_1,
                    Win_2 = s.Win_2,
                    Id = s.Id})
                .ToListAsync();

            return Ok(Json(new { Duels = duels,  Name = task.Name}));
        }

        [HttpGet("get/duel/{id}")]
        public async Task<ActionResult> GetDuels(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);

            var duel = await _context.Duels
                .Where(s => s.Id == id)
                .Select(s => new {Solution_1 = s.Solution_1.Code, 
                    Solution_2 = s.Solution_2.Code, 
                    Task = s.Solution_1.Task})
                .FirstOrDefaultAsync();
            if (duel == null)
            {
                return NotFound();
            }
            if (!await _check.CheckParticipantByTask(duel.Task.Id, auth_header))
            {
                return NotFound();
            }

            return Ok(Json(duel));
        }

        [HttpGet("get/result/{id}")]
        public async Task<ActionResult> GetResult(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int user_id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(user_id);
            if (user == null)
            {
                return NotFound();
            }

            var competition = await _context.Competitions.FindAsync(id);
            if(competition == null)
            {
                return NotFound();
            }

            var user_competition = await _context.UsersCompetitions
                .Where(s => (s.CompetitionId == id))
                .Select(s => s.User)
                .ToListAsync();
            if (competition.UserId != user.Id && !user_competition.Contains(user))
            {
                return NotFound();
            }
            user_competition.Add(user);
            var task = await _context.Tasks
                .Where(s => (s.CompetitionId == id))
                .Select(s => s.Id)
                .ToListAsync();
            var solution = await _context.Solutions
                .Where(s => task.Contains(s.TaskId))
                .ToListAsync();
            var duel = await _context.Duels
                .Where(s => (solution.Contains(s.Solution_1) ||
                solution.Contains(s.Solution_2)))
                .ToListAsync();

            ResultCompetitionModel[] model = new ResultCompetitionModel[user_competition.Count];
            for(int i = 0; i < user_competition.Count; i++)
            {
                int point = 0;
                duel = duel
                    .Where(s => (s.Solution_1.UserId == user_competition[i].Id ||
                        s.Solution_2.UserId == user_competition[i].Id))
                    .ToList();
                for(int j = 0; j < duel.Count; j++)
                {
                    if(duel[j].Solution_1.UserId == user_competition[i].Id)
                    {
                        if(duel[j].Win_1 == true && duel[j].Win_2 == true)
                        {
                            point++;
                        }
                        else if(duel[j].Win_1 == true && duel[j].Win_2 == false)
                        {
                            point += 2;
                        }
                    }
                    else
                    {
                        if (duel[j].Win_1 == true && duel[j].Win_2 == true)
                        {
                            point++;
                        }
                        else if (duel[j].Win_1 == false && duel[j].Win_2 == true)
                        {
                            point += 2;
                        }
                    }
                }
                model[i] = new ResultCompetitionModel
                {
                    Name = user_competition[i].Nickname,
                    Points = point
                };
            }

            var sort = model.OrderBy(x => x.Points);

            return Ok(Json(new { Model = model, Competition = competition.Name}));
        }

        [HttpPost("addlist/{id}")]
        public async Task<ActionResult> AddList(int id, [Bind("Win_1", "Win_2", "SolutionId_1", "SolutionId_2")] Duel [] duel)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            if (!await _check.CheckParticipantByTask(id, auth_header))
            {
                return NotFound();
            }

            var duels = await _context.Duels
                .Where(s => (s.Solution_1.TaskId == id ||
                    s.Solution_2.TaskId == id))
                .ToListAsync();
            if(duels != null)
            {
                _context.Duels.RemoveRange(duels);
            }
            await _context.Duels.AddRangeAsync(duel);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
