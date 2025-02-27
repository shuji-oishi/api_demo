import mysql from 'mysql2/promise';

// �f�[�^�x�[�X�ڑ��ݒ�
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_SSL ? { rejectUnauthorized: false } : false
};

// �f�[�^�x�[�X�ڑ��v�[���̍쐬
let pool;
const getPool = async () => {
  console.log('Attempting to create or get database pool');
  if (!pool) {
    console.log('Creating new database pool with config:', {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT || 3306,
      ssl: !!process.env.MYSQL_SSL
      // �p�X���[�h�̓Z�L�����e�B�̂��߃��O�ɏo�͂��Ȃ�
    });
    pool = mysql.createPool(dbConfig);
    console.log('Database pool created successfully');
  } else {
    console.log('Using existing database pool');
  }
  return pool;
};

// API�n���h���[�֐�
export default async function handler(req, res) {
  console.log(`API request received: ${req.method} ${req.url}`);
  console.log('Query parameters:', req.query);
  
  try {
    // ���N�G�X�g���\�b�h�̊m�F�iGET�APOST���j
    if (req.method !== 'GET') {
      console.log(`Method not allowed: ${req.method}`);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // ���ϐ��m�F
    console.log('Checking environment variables...');
    if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || 
        !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
      console.error('Missing required environment variables');
      return res.status(500).json({ 
        message: 'Server configuration error: Missing database credentials' 
      });
    }
    console.log('Environment variables check passed');

    // �R�l�N�V�����v�[���̎擾
    console.log('Getting database connection pool...');
    const pool = await getPool();
    
    // �N�G���̎��s�i��Fusers�e�[�u������f�[�^���擾�j
    const query = 'SELECT * FROM wp_posts LIMIT 10';
    console.log(`Executing query: ${query}`);
    
    const [rows] = await pool.query(query);
    console.log(`Query executed successfully. Retrieved ${rows.length} rows`);
    
    // ���ʂ�Ԃ�
    console.log('Sending successful response');
    return res.status(200).json({ data: rows });
    
  } catch (error) {
    console.error('Database error details:', error);
    console.error('Error stack:', error.stack);
    
    // ���ڍׂȃG���[���
    let errorMessage = 'Database operation failed';
    let errorCode = error.code || 'UNKNOWN_ERROR';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Could not connect to database server';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Database access denied (wrong credentials)';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = 'Database does not exist';
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Table does not exist';
    }
    
    console.error(`Sending error response: ${errorCode} - ${errorMessage}`);
    
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString()
    });
  } finally {
    console.log('API request handling completed');
  }
}