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
    public class TaskController : Controller
    {
        private readonly OnlyProgliContext _context;
        private readonly JWTAuthService _jwt;
        private readonly CheckAccessService _check;
        public TaskController(OnlyProgliContext context,
                                JWTAuthService jwt, 
                                CheckAccessService check)
        {
            _context = context;
            _jwt = jwt;
            _check = check;
        }

        [HttpPost("add")]
        public async Task<ActionResult> Add(TaskModel add)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            if (!await _check.CheckParticipantByCompetition(add.CompetitionId, auth_header))
            {
                return NotFound();
            }

            var check_name = await _context.Tasks
                .Where(s => (add.CompetitionId == s.CompetitionId && s.Name == add.Name))
                .FirstOrDefaultAsync();
            if (check_name != null)
            {
                return BadRequest();
            }

            var task = new Entity.Task
            {
                Name = add.Name,
                Description = add.Description,
                BeginDate = add.BeginDate,
                EndDate = add.EndDate,
                Matrix = add.Matrix,
                CompetitionId = add.CompetitionId
            };
            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("check/author/{id}")]
        public async Task<ActionResult> CheckAuthor(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            if(! await _check.CheckParticipantByCompetition(id, auth_header))
            {
                return NotFound();
            }
            return Ok();
        }

        [HttpGet("get/{id}")]
        public async Task<ActionResult> Get(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int user_id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(user_id);
            if (user == null)
            {
                return NotFound();
            }

            var task = await _context.Tasks.FindAsync(id);
            if(task == null)
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
            return Ok(Json(task));
        }

        [HttpGet("getlist/{id}/{min}&{max}&{name}&{begin}&{end}")]
        public async Task<ActionResult> GetList(int id, int min, int max, string name, long begin, long end)
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

            var competition = await _context.Competitions.FindAsync(id);
            if(competition == null)
            {
                return NotFound();
            }
            if (competition.UserId != user.Id)
            {
                return NotFound();
            }

            var task = await _context.Tasks
                .Where(u => (u.CompetitionId == competition.Id))
                .ToListAsync();
            if (task == null)
            {
                return NotFound();
            }

            if (name != "name=")
            {
                var new_name = name.Remove(0, 5);
                task = task
                    .Where(s => s.Name.Contains(new_name))
                    .ToList();
            }
            DateTime begin_date = new();
            if (begin != 0)
            {
                begin_date = new DateTime(1970, 1, 1);
                begin_date = begin_date.AddMilliseconds(begin);
               task = task
                    .Where(s => (s.EndDate > begin_date))
                    .ToList();
            }
            if (end != 0)
            {
                DateTime end_date = new DateTime(1970, 1, 1);
                end_date = end_date.AddMilliseconds(end);
                task = task
                    .Where(s => (s.BeginDate < end_date))
                    .ToList();
            }
            int count = task.Count;
            Boolean forward = (count > (max - min));
            if (count >= (max - min))
            {
                task = task.GetRange(min, max);
            }
            var is_solution = await _context.Solutions
                .Where(s => (task.Contains(s.Task) && 
                    s.UserId == user.Id))
                .Select(s => s.TaskId)
                .ToListAsync();
            return Ok(Json(new
            {
                Name = competition.Name,
                Task = task,
                Is_solution = is_solution,
                Forward = forward,
                Is_author = (user.Id == competition.UserId)
            }));
        }

        [HttpPut("update/{id}")]
        public async Task<ActionResult> Update(int id, [Bind("Name", "Description", "BeginDate", "EndDate", "CompetitionId")] TaskModel update)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            if (!await _check.CheckParticipantByCompetition(update.CompetitionId, auth_header))
            {
                return NotFound();
            }

            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            if(update.Name != task.Name)
            {
                var check_name = await _context.Tasks
                .Where(s => (update.CompetitionId == s.CompetitionId && s.Name == update.Name))
                .FirstOrDefaultAsync();
                if (check_name != null)
                {
                    return BadRequest();
                }
            }

            task.Name = update.Name;
            task.Description = update.Description;
            task.BeginDate = update.BeginDate;
            task.EndDate = update.EndDate;  
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            if (!await _check.CheckParticipantByCompetition(task.CompetitionId, auth_header))
            {
                return NotFound();
            }

            var solution = await _context.Solutions
                .Where(s => (s.TaskId == task.Id))
                .ToListAsync();
            List<Duel> duel = new();

            foreach (var items in solution)
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
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("get/settings/{id}")]
        public async Task<ActionResult> GetSettings(int id)
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            if (! await _check.CheckParticipantByCompetition(task.CompetitionId, auth_header))
            {
                return NotFound();
            }

            return Ok(Json(task));
        }
    }
}
