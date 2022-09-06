using Project2.Entity;

namespace Project2.Models
{
    public class ResultJwtModel
    { 
        public AccessTokenModel AccessToken { get; set; }
        public RefreshToken RefreshToken { get; set; }
    }
}
