using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Project2.Models;
using Project2.Entity;
using Project2.Data;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Project2.Service
{
    public class JWTAuthService
    {
        private readonly JwtModel _jwt;
        private readonly OnlyProgliContext _context;

        public JWTAuthService(JwtModel jwt, OnlyProgliContext context)
        {
            _jwt = jwt;
            _context = context;
        }

        public async Task<ResultJwtModel> GetTokens(string email)
        {
            var user = await _context.Users
                .Where(u => u.Email == email)
                .FirstOrDefaultAsync();
            if (user == null)
            {
                return null;
            }

            RefreshToken refrech_token = CreateRefreshToken(user.Id);
            await _context.RefreshTokens.AddAsync(refrech_token);
            await _context.SaveChangesAsync();

            return new ResultJwtModel
            {
                AccessToken = new AccessTokenModel
                {
                    Token = CreateToken(user.Id),
                    Date = DateTime.Now.AddMinutes(_jwt.AccessTokenExpiration)
                },
                RefreshToken = refrech_token
            };
        }

        public async System.Threading.Tasks.Task DeleteRefreshToken(int id, string refresh_token) 
        {
            var token = await _context.RefreshTokens
                    .Where(f => f.UserId == id &&
                    f.Token == refresh_token)
                    .FirstOrDefaultAsync();
            _context.RefreshTokens.Remove(token);
            await _context.SaveChangesAsync();
        }

        public async System.Threading.Tasks.Task DeleteExceptRefreshToken(int id, string refresh_token) 
        {
            var token = await _context.RefreshTokens
                    .Where(f => f.UserId == id &&
                    f.Token != refresh_token)
                    .ToListAsync();
            _context.RefreshTokens.RemoveRange(token);
            await _context.SaveChangesAsync();
        }

        public int GetId(string token) 
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            string id = jwt.Claims.First(c => c.Type == "id").Value;
            return Convert.ToInt32(id);
        }

        public async Task<ResultJwtModel> RefreshToken(string access_token, string refresh_token) 
        {
            ClaimsPrincipal claims = GetPrincipalFromToken(access_token);
            if(claims == null)
            {
                return null;
            }

            string id = claims.Claims
                .First(c => c.Type == "id")
                .Value;
            var user = await _context.Users.FindAsync(Convert.ToInt32(id));
            if (user == null)
            {
                return null;
            }

            var token = await _context.RefreshTokens
                   .Where(f => f.UserId == user.Id && 
                   f.Token == refresh_token && 
                   f.EndDate >= DateTime.Now)
                   .FirstOrDefaultAsync();
            if (token == null)
            {
                return null;
            }

            RefreshToken new_refresh_token = CreateRefreshToken(user.Id);
            _context.RefreshTokens.Remove(token);
            await _context.RefreshTokens.AddAsync(new_refresh_token);
            await _context.SaveChangesAsync();

            return new ResultJwtModel
            {
                AccessToken = new AccessTokenModel
                {
                    Token = CreateToken(user.Id),
                    Date = DateTime.Now.AddMinutes(_jwt.AccessTokenExpiration)
                },
                RefreshToken = new_refresh_token
            };
        }

        private string CreateToken(int id) 
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim("id", id.ToString())
            };
            var token = new JwtSecurityToken(
                    issuer: _jwt.Issuer,
                    audience: _jwt.Audience,
                    notBefore: DateTime.Now,
                    claims: claims,
                    expires: DateTime.Now.AddMinutes(_jwt.AccessTokenExpiration),
                    signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private RefreshToken CreateRefreshToken(int id) 
        {
            var randomNumber = new byte[32];
            using (var generator = new RNGCryptoServiceProvider())
            {
                generator.GetBytes(randomNumber);
                return new RefreshToken
                {
                    Token = Convert.ToBase64String(randomNumber),
                    UserId = id,
                    BeginDate = DateTime.Now,
                    EndDate = DateTime.Now.AddDays(_jwt.RefreshTokenExpiration)
                };
            }
        }

        private ClaimsPrincipal GetPrincipalFromToken(string token) 
        {
            JwtSecurityTokenHandler validator = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _jwt.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwt.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateLifetime = false
            };
            try
            {
                var principal = validator.ValidateToken(token, parameters, out var securityToken);

                if (!(securityToken is JwtSecurityToken jwtSecurityToken) || 
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch  
            {
                return null;
            }
        }
    }
}