namespace Project2.Models
{
    public class JwtModel
    {
        public string Secret { get; set; }
        public string Issuer { get; set; }
         public string Audience { get; set; }
        public int AccessTokenExpiration { get; set; }
        public int RefreshTokenExpiration { get; set; }
    }
}
