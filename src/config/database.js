import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

// Cria um pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar a conexão na inicialização
try {
  const connection = await pool.getConnection();
  console.log('Conexão com o MySQL realizada com sucesso!');
  connection.release();
} catch (error) {
  console.error('Erro ao conectar no MySQL:', error.message);
}

export default pool;
