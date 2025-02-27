import mysql from 'mysql2/promise';

// �f�[�^�x�[�X�ڑ��ݒ�
const dbConfig = {
  host: 52.35.92.59,
  user: migiteq_remote,
  password: migiteqdev0220!DB,
  database: kids_dento_wp,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_SSL ? { rejectUnauthorized: false } : false
};

// �f�[�^�x�[�X�ڑ��v�[���̍쐬
let pool;
const getPool = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// API�n���h���[�֐�
export default async function handler(req, res) {
  try {
    // ���N�G�X�g���\�b�h�̊m�F�iGET�APOST���j
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // �R�l�N�V�����v�[���̎擾
    const pool = await getPool();
    
    // �N�G���̎��s�i��Fusers�e�[�u������f�[�^���擾�j
    const [rows] = await pool.query('SELECT * FROM wp_options LIMIT 10');
    
    // ���ʂ�Ԃ�
    return res.status(200).json({ data: rows });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}