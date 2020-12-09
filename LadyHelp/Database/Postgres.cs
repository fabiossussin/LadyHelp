using Npgsql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Database.Postgres
{
    public class Postgres
    {
        NpgsqlConnection PgsqlConnection = null;
        string ConnString = string.Format("Server={0};Port={1};User Id={2};Password={3};Database={4};",
                                          PostgresConnection.ServerName, PostgresConnection.Port, PostgresConnection.UserName, PostgresConnection.Password, PostgresConnection.DatabaseName);

        //Pega todos os registros
        public DataTable FindAll(string tableName)
        {
            var dt = new DataTable();

            try
            {
                using (PgsqlConnection = new NpgsqlConnection(ConnString))
                {
                    // abre a conexão com o PgSQL e define a instrução SQL
                    PgsqlConnection.Open();
                    string cmdSeleciona = $"Select * from {tableName} order by id";

                    using (NpgsqlDataAdapter Adpt = new NpgsqlDataAdapter(cmdSeleciona, PgsqlConnection))
                    {
                        Adpt.Fill(dt);
                    }
                }
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                PgsqlConnection.Close();
            }

            return dt;
        }

        public DataTable FindTemporarioServices(string tableName, string parameter)
        {
            var dt = new DataTable();

            try
            {
                using (PgsqlConnection = new NpgsqlConnection(ConnString))
                {
                    // abre a conexão com o PgSQL e define a instrução SQL
                    PgsqlConnection.Open();
                    var cmdSeleciona = $"Select * from {tableName}, unnest(services) a WHERE  lower(a) ilike '%{ parameter }%'";

                    using (NpgsqlDataAdapter Adpt = new NpgsqlDataAdapter(cmdSeleciona, PgsqlConnection))
                    {
                        Adpt.Fill(dt);
                    }
                }
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                PgsqlConnection.Close();
            }

            return dt;
        }

        public DataTable FindTemporario2Workers(string tableName, string parameter)
        {
            var dt = new DataTable();

            try
            {
                using (PgsqlConnection = new NpgsqlConnection(ConnString))
                {
                    // abre a conexão com o PgSQL e define a instrução SQL
                    PgsqlConnection.Open();
                    var cmdSeleciona = $"Select * from {tableName} where name ilike '%{ parameter }%'";

                    using (NpgsqlDataAdapter Adpt = new NpgsqlDataAdapter(cmdSeleciona, PgsqlConnection))
                    {
                        Adpt.Fill(dt);
                    }
                }
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                PgsqlConnection.Close();
            }

            return dt;
        }

        //Pega um registro pelo codigo
        public DataTable FindById(string tableName, string id)
        {
            var dt = new DataTable();

            try
            {
                using (PgsqlConnection = new NpgsqlConnection(ConnString))
                {
                    //Abra a conexão com o PgSQL
                    PgsqlConnection.Open();
                    var cmdSeleciona = $"Select * from { tableName } Where id = { id }";

                    using (NpgsqlDataAdapter Adpt = new NpgsqlDataAdapter(cmdSeleciona, PgsqlConnection))
                    {
                        Adpt.Fill(dt);
                    }
                }
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                PgsqlConnection.Close();
            }

            return dt;
        }

        //Inserir registros
        public void Add(string tableName, Dictionary<string, dynamic> properties)
        {

            try
            {
                using (PgsqlConnection = new NpgsqlConnection(ConnString))
                {
                    //Abra a conexão com o PgSQL                  
                    PgsqlConnection.Open();
                    var cmdInserir = $"Insert Into { tableName }({ string.Join(',', properties.Select(x => x.Key.ToString())) }) values({ string.Join(',', properties.Select(x => x.Value.ToString())) })";

                    using (NpgsqlCommand pgsqlcommand = new NpgsqlCommand(cmdInserir, PgsqlConnection))
                    {
                        pgsqlcommand.ExecuteNonQuery();
                    }
                }
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                PgsqlConnection.Close();
            }
        }

        //Atualiza registros
        public void Update(string tableName, Dictionary<string, dynamic> properties, string id)
        {
            try
            {
                using (PgsqlConnection = new NpgsqlConnection(ConnString))
                {
                    //Abra a conexão com o PgSQL                  
                    PgsqlConnection.Open();
                    var cmdAtualiza = $"Update { tableName } Set { properties.Select(x => $"{ x.Key } = '{ x.Value}', ") } Where id = { id }";

                    using (NpgsqlCommand pgsqlcommand = new NpgsqlCommand(cmdAtualiza, PgsqlConnection))
                    {
                        pgsqlcommand.ExecuteNonQuery();
                    }
                }
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                PgsqlConnection.Close();
            }
        }

        //Deleta registros
        public void Delete(string tableName, string id)
        {
            try
            {
                using (PgsqlConnection = new NpgsqlConnection(ConnString))
                {
                    //abre a conexao                
                    PgsqlConnection.Open();
                    var cmdDeletar = $"Delete From { tableName } Where id = '{ id }'";

                    using (NpgsqlCommand pgsqlcommand = new NpgsqlCommand(cmdDeletar, PgsqlConnection))
                    {
                        pgsqlcommand.ExecuteNonQuery();
                    }
                }
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                PgsqlConnection.Close();
            }
        }

        public class PostgresConnection
        {
            public static string ServerName = "localhost"; //localhost
            public static string Port = "5432"; //porta default
            public static string UserName = "postgres"; //nome do administrador
            public static string Password = "fabio123"; //senha do administrador
            public static string DatabaseName = "LadyHelp"; //nome do banco de dados
        }
    }
}
