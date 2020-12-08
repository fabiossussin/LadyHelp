using Database.Postgres;
using LadyHelp.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Models.User
{
    public class ApplicationUser : BaseEntity
    {
        #region BasicInfo
        [Required(ErrorMessage = "O campo Nome deve ser informado"), Display(Name = "Nome")]
        public string Name { get; set; }

        [Required(ErrorMessage = "O campo CPF deve ser informado"), StringLength(11, ErrorMessage = "A {0} deve conter {2} caracteres.", MinimumLength = 11)]
        [Display(Name = "CPF")]
        public string Cpf { get; set; }

        [Display(Name = "RG")]
        public string Rg { get; set; }

        [DataType(DataType.PhoneNumber)]
        [Display(Name = "Telefone")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "O campo Data de Nascimento deve ser informado"), DataType(DataType.Date)]
        [Display(Name = "Data de Nascimento")]
        public DateTime BirthDay { get; set; }

        [Display(Name = "Imagem de Perfil")]
        public string ImageProfile { get; set; }

        public int PersonType { get; set; }
        #endregion

        #region AccountData
        [Required(ErrorMessage = "O campo Email deve ser informado"), EmailAddress, Display(Name = "Email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "O campo Senha deve ser informado"), StringLength(100, ErrorMessage = "A {0} deve conter no mínimo {2} e no máximo {1} caracteres.", MinimumLength = 6)]
        [DataType(DataType.Password), Display(Name = "Senha")]
        public string Password { get; set; }

        [Required(ErrorMessage = "O campo de confirmação de Senha deve ser informado"), DataType(DataType.Password), Display(Name = "Confirmação de Senha")]
        [Compare("Password", ErrorMessage = "As senhas não coincidem. Tente novamente")]
        public string ConfirmPassword { get; set; }

        [Display(Name = "Serviços Prestados")]
        public List<string> Services { get; set; }
        #endregion

        #region Address
        [Required(ErrorMessage = "O campo CEP deve ser informado"), StringLength(9, ErrorMessage = "O {0} deve deve ser informado corretamente", MinimumLength = 8), Display(Name = "CEP")]
        public string ZipCode { get; set; }

        [Display(Name = "Número")]
        public string HouseNumber { get; set; }

        [Required(ErrorMessage = "O campo Logradouro deve ser informado"), Display(Name = "Logradouro")]
        public string Street { get; set; }

        [Required(ErrorMessage = "O campo Cidade deve ser informado"), Display(Name = "Cidade")]
        public string City { get; set; }

        [Required(ErrorMessage = "O campo Estado deve ser informado"), Display(Name = "Estado")]
        public string State { get; set; }

        [Required(ErrorMessage = "O campo Bairro deve ser informado"), Display(Name = "Bairro")]
        public string Neighborhood { get; set; }

        [Display(Name = "Complemento")]
        public string Complement { get; set; }
        #endregion

        private static string TableName = "ApplicationUser";
        public static List<ApplicationUser> FindAll()
        {
            var result = new Postgres().FindAll(TableName);

            return null;
        }

        public static ApplicationUser FindById(string id)
        {
            var result = new Postgres().FindById(TableName, id);

            return null;
        }

        public static void Add(ApplicationUser applicationUser) =>
            new Postgres().Add(TableName, GetProperties(applicationUser));

        public static void Update(ApplicationUser applicationUser) =>
            new Postgres().Update(TableName, GetProperties(applicationUser), applicationUser.Id);

        public static void Delete(string id) =>
            new Postgres().Delete(TableName, id);

        private static Dictionary<string, dynamic> GetProperties(ApplicationUser applicationUser)
        {
            var myDict = new Dictionary<string, dynamic>();
            var t = applicationUser.GetType();
            foreach (PropertyInfo pi in t.GetProperties())
            {
                var value = pi.GetValue(applicationUser);
                if (value == null)
                    continue;

                var pt = pi.PropertyType;
                if (pt == typeof(string))
                    value = $"'{ value.ToString() }'";
                else if (pt == typeof(DateTime))
                    value = $"'{((DateTime)value).ToString("dd/MM/yyyy")}'";

                myDict[pi.Name] = value.ToString();
            }

            return myDict;
        }

    }

    public enum PersonType
    {
        Commom,
        Worker
    }
}
