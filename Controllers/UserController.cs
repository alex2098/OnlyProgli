using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using Project2.Service;
using Project2.Models;
using Project2.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Project2.Entity;

namespace Project2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : Controller
    {

        private readonly OnlyProgliContext _context;
        private readonly MailService _mail;
        private readonly JWTAuthService _jwt;
        private readonly MailModel _mail_model;

        public UserController(OnlyProgliContext context, 
                             MailService mail,
                             JWTAuthService jwt,
                             MailModel mail_model)
        {
            _context = context;
            _mail = mail;
            _jwt = jwt;
            _mail_model = mail_model;
        }

        [HttpPost("check/full")]
        public async Task<ActionResult> Check([Bind("Email", "Nickname")] UserModel check) 
        {
            if(check.Nickname != null)
            {
                var check_nickname = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.Nickname == check.Nickname)
                    .FirstOrDefaultAsync(); 

                if(check_nickname != null)
                {
                    return BadRequest(Json("nickname"));
                }
            }
            if(check.Email != null)
            {
                var check_email = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.Email == check.Email)
                    .FirstOrDefaultAsync(); ;

                if (check_email != null)
                {
                    return BadRequest(Json("nickname"));
                }

                Random random = new Random();
                string result = random.Next(100000, 999999).ToString();
                await _mail.SendEmailAsync(check.Email, "регистрация", result);
                return Ok(Json(result));
            }
            return Ok();
        }

        [HttpPost("add")]
        public async Task<ActionResult> Add(UserModel add) 
        {
            var user = new User
            {
                Email = add.Email,
                Nickname = add.Nickname,
                Password = add.Password
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            ResultJwtModel result =  await _jwt.GetTokens(add.Email);
            var cookie_options = new CookieOptions
            {
                HttpOnly = true,
                Expires = result.RefreshToken.EndDate,
                Secure = true
            };
            Response.Cookies.Append("cookie", result.RefreshToken.Token, cookie_options);
            return Ok(Json(result.AccessToken));
        }

        [HttpPost("login")]
        public async Task<ActionResult> CheckLogin([Bind("Email", "Password")] UserModel login) 
        {
            var user = await _context.Users
                .AsNoTracking()
                .Where(u => (u.Email == login.Email && 
                    u.Password == login.Password))
                .FirstOrDefaultAsync();

            if (user != null)
            {
                ResultJwtModel result = await _jwt.GetTokens(login.Email);
                var cookie_options = new CookieOptions
                {
                    HttpOnly = true,
                    Expires = result.RefreshToken.EndDate,
                    Secure = true
                };
                Response.Cookies.Append("cookie", result.RefreshToken.Token, cookie_options);
                return Ok(Json(result.AccessToken));
            }
            return BadRequest();
        }

        [HttpPost("check/email")]
        public async Task<ActionResult> CheckEmail([Bind("Email")] UserModel email) 
        {
            var check_email = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.Email == email.Email)
                    .FirstOrDefaultAsync();

            if (check_email != null)
            {
                return BadRequest();
            }

            Random random = new Random();
            string result = random.Next(100000, 999999).ToString();
            await _mail.SendEmailAsync(email.Email, "восстановление аккаунта", result);
            return Ok();
        }

        [HttpPut("recovery")]
        public async Task<ActionResult> Recovery([Bind("Email", "Password")] UserModel recovery) 
        {
            var user = await _context.Users
                .Where(u => u.Email == recovery.Email)
                .SingleAsync();
            user.Password = recovery.Password;
            await _context.SaveChangesAsync();
            ResultJwtModel result = await _jwt.GetTokens(recovery.Email);
            var cookie_options = new CookieOptions
            {
                HttpOnly = true,
                Expires = result.RefreshToken.EndDate,
                Secure = true
            };
            Response.Cookies.Append("cookie", result.RefreshToken.Token, cookie_options);
            return Ok(result.AccessToken);
        }

        [Authorize]
        [HttpDelete("exit")]
        public async Task<ActionResult> Exit() 
        {
            string auth_header = Request.Headers["Authorization"]
                .ToString()
                .Remove(0, 7);
            var refresh_token = Request.Cookies["cookie"];
            int id = _jwt.GetId(auth_header);
            await _jwt.DeleteRefreshToken(id, refresh_token);
            Response.Cookies.Delete("cookie");
            return Ok();
        }

        [Authorize]
        [HttpDelete("delete")]
        public async Task<ActionResult> Delete() 
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            await _jwt.DeleteExceptRefreshToken(id, "");
            user.Nickname = "Аккаунт удален";
            user.Email = null;
            user.Password = null;
            await _context.SaveChangesAsync();
            Response.Cookies.Delete("cookie");
            return Ok();
        }

        [Authorize]
        [HttpPost("support")]
        public async Task<ActionResult> Suppport([FromBody] string text)
        {
            string token = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int id = _jwt.GetId(token);
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            await _mail.SendEmailAsync(_mail_model.Autor, user.Email, text);
            return Ok();
        }

        [Authorize]
        [HttpGet("get")]
        public async Task<ActionResult> Get() 
        {
            string token = Request.Headers["Authorization"].ToString().Remove(0, 7);
            int id = _jwt.GetId(token);
            var user = await _context.Users.FindAsync(id);

            if(user == null)
            {
                return NotFound();
            }
            return Ok(Json(user));
        }

        [Authorize]
        [HttpPut("update")]
        public async Task<ActionResult> Update(UserModel update) 
        {
            string auth_header = Request.Headers["Authorization"].ToString().Remove(0, 7);
            var refresh_token = Request.Cookies["cookie"];
            int id = _jwt.GetId(auth_header);
            var user = await _context.Users.FindAsync(id);

            if(user == null)
            {
                return NotFound();
            }

            user.Email = update.Email;
            user.Nickname = update.Nickname;
            user.Password = update.Password;
            await _context.SaveChangesAsync();

            await _jwt.DeleteExceptRefreshToken(id, refresh_token);
            ResultJwtModel result = await _jwt.RefreshToken(auth_header, refresh_token);

            if (result != null)
            {
                var cookie_options = new CookieOptions
                {
                    HttpOnly = true,
                    Expires = result.RefreshToken.EndDate,
                    Secure = true
                };
                Response.Cookies.Delete("cookie");
                Response.Cookies.Append("cookie", result.RefreshToken.Token, cookie_options);
                return Ok(Json(result.AccessToken));
            }
            return BadRequest();
        }

        [HttpPut("refresh")]
        public async Task<ActionResult> Refresh([Bind("Token")] AccessTokenModel access_token) 
        {
            var refresh_token = Request.Cookies["cookie"];
            ResultJwtModel result = await _jwt.RefreshToken(access_token.Token, refresh_token);

            if (result != null)
            {
                var cookie_options = new CookieOptions
                {
                    HttpOnly = true,
                    Expires = result.RefreshToken.EndDate,
                    Secure = true
                };
                Response.Cookies.Delete("cookie");
                Response.Cookies.Append("cookie", result.RefreshToken.Token, cookie_options);
                return Ok(Json(result.AccessToken));
            }
            return BadRequest();
        }
    }
}
