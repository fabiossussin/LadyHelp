using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Models.User;

namespace LadyHelp.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [HttpPost, Route("CadastrarEmailNotificacao")]
        public async Task<IActionResult> SaveMail([FromForm] ApplicationUser data)
        {
            return Redirect($"#title={Uri.EscapeDataString("Falha ao Salvar")}&message={Uri.EscapeDataString("teste")}&type=warning");
        }
    }
}
