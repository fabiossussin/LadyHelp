using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Database.Postgres;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.User;

namespace LadyHelp.Controllers
{
    [Route("Home"), Route(""), AllowAnonymous]
    public class HomeController : Controller
    {

        [HttpGet, Route("Index"), Route(""), AllowAnonymous]
        public IActionResult GetWorkers(string parameter) =>
            View("Index", GetListWorkers(parameter));

        private List<ApplicationUser> GetListWorkers(string parameter)
        {
            var result = new List<ApplicationUser>();

            if (string.IsNullOrEmpty(parameter))
            {
                var all = new Postgres().FindAll(TableName);
                for (var i = 0; i < all.Rows.Count; i++)
                    result.Add(Formatter(all.Rows[i]));

                return result;
            }

            var dtServices = new Postgres().FindTemporarioServices(TableName, parameter);
            var dtWorkers = new Postgres().FindTemporario2Workers(TableName, parameter);

            for (var i = 0; i < dtServices.Rows.Count; i++)
                result.Add(Formatter(dtServices.Rows[i]));

            for (var i = 0; i < dtWorkers.Rows.Count; i++)
                result.Add(Formatter(dtWorkers.Rows[i]));

            return result;
        }

        private ApplicationUser Formatter(DataRow row) =>
            new ApplicationUser
            {
                BirthDay = row["BirthDay"].GetType() != typeof(DBNull) ? (DateTime)row["BirthDay"] : DateTime.MinValue,
                Email = row["Email"]?.ToString(),
                Phone = row["Phone"]?.ToString(),
                Name = row["Name"]?.ToString(),
                Services = row["services"].GetType() != typeof(DBNull) ? ((string[])row["Services"]).ToList() : new List<string>(),
            };


        private static string TableName = "ApplicationUser";
    }
}
