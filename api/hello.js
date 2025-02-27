import mysql from 'mysql2/promise';

// データベース接続設定
const dbConfig = {
  host: 52.35.92.59,
  user: migiteq_remote,
  password: migiteqdev0220!DB,
  database: kids_dento_wp,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_SSL ? { rejectUnauthorized: false } : false
};

// データベース接続プールの作成
let pool;
const getPool = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// APIハンドラー関数
export default async function handler(req, res) {
  try {
    // リクエストメソッドの確認（GET、POST等）
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // コネクションプールの取得
    const pool = await getPool();
    
    // クエリの実行（例：usersテーブルからデータを取得）
    const [rows] = await pool.query('SELECT * FROM wp_options LIMIT 10');
    
    // 結果を返す
    return res.status(200).json({ data: rows });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}