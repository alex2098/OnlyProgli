using MailKit.Net.Smtp;
using MimeKit;
using Project2.Models;
using System.Threading.Tasks;

namespace Project2.Service
{
    public class MailService
    {
        private readonly MailModel _mail;
        public MailService(MailModel mail)
        {
            _mail = mail;
        }
        public async Task SendEmailAsync(string mail, string subject, string text)
        {
            MimeMessage message = new MimeMessage();
            message.From.Add(new MailboxAddress(_mail.Name, _mail.Autor)); 
            message.To.Add(new MailboxAddress("", mail)); 
            message.Subject = subject; 
            message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text = text
            };

            using (var client = new SmtpClient())
            {
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                await client.ConnectAsync(_mail.Connect, _mail.Port); 
                await client.AuthenticateAsync(_mail.Autor, _mail.Password); 
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
        }
    }
}
