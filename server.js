// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// 初始化数据库
const dbPath = path.resolve(__dirname, 'students.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    studentId TEXT UNIQUE,
    wechat TEXT,
    dorm TEXT,
    classId TEXT
  )`);
});

// 普通学生注册
app.post('/register', (req, res) => {
  const { name, studentId, wechat } = req.body;

  db.get(`SELECT * FROM students WHERE studentId = ?`, [studentId], (err, row) => {
    if (err) return res.status(500).json({ message: '数据库错误' });
    if (row) return res.status(400).json({ message: '该学号已存在！' });

    const dorm = 'A栋305';
    const classId = '软件工程1班';

    db.run(`INSERT INTO students (name, studentId, wechat, dorm, classId)
      VALUES (?, ?, ?, ?, ?)`,
      [name, studentId, wechat, dorm, classId], function (err) {
        if (err) return res.status(500).json({ message: '插入失败' });
        res.json({ message: '录入成功！' });
      });
  });
});

// 获取同班同学
app.post('/class-info', (req, res) => {
  const { studentId } = req.body;

  db.get(`SELECT * FROM students WHERE studentId = ?`, [studentId], (err, student) => {
    if (err) return res.status(500).json({ message: '数据库错误' });
    if (!student) return res.status(404).json({ message: '学号不存在或未注册' });

    db.all(`SELECT name, wechat FROM students WHERE classId = ?`,
      [student.classId], (err, classmates) => {
        if (err) return res.status(500).json({ message: '查询失败' });
        res.json({ yourInfo: student, classmates });
      });
  });
});

// 修改信息
app.post('/update', (req, res) => {
  const { studentId, name, wechat } = req.body;
  db.run(`UPDATE students SET name = ?, wechat = ? WHERE studentId = ?`,
    [name, wechat, studentId], function (err) {
      if (err) return res.status(500).json({ message: '数据库更新失败' });
      if (this.changes === 0) return res.status(404).json({ message: '学号未找到' });
      res.json({ message: '信息更新成功！' });
    });
});

// 删除学生
app.post('/delete', (req, res) => {
  const { studentId } = req.body;
  db.run(`DELETE FROM students WHERE studentId = ?`, [studentId], function (err) {
    if (err) return res.status(500).json({ message: '删除失败' });
    if (this.changes === 0) return res.status(404).json({ message: '学号未找到' });
    res.json({ message: '已成功删除你的信息！' });
  });
});

// 管理员密码（可自定义）
const ADMIN_PASSWORD = '12345';

// 管理员登录
app.post('/admin-login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ message: '密码错误' });
  }
});

// 获取所有学生
app.get('/admin/students', (req, res) => {
  db.all(`SELECT * FROM students`, (err, rows) => {
    if (err) return res.status(500).json({ message: '查询失败' });
    res.json(rows);
  });
});

// 管理员添加学生
app.post('/admin/add', (req, res) => {
  const { name, studentId, wechat, dorm, classId } = req.body;
  db.run(`INSERT INTO students (name, studentId, wechat, dorm, classId)
    VALUES (?, ?, ?, ?, ?)`, [name, studentId, wechat, dorm, classId], function (err) {
    if (err) return res.status(500).json({ message: '插入失败，可能是学号重复' });
    res.json({ message: '添加成功' });
  });
});

// 管理员删除学生
app.post('/admin/delete', (req, res) => {
  const { studentId } = req.body;
  db.run(`DELETE FROM students WHERE studentId = ?`, [studentId], function (err) {
    if (err) return res.status(500).json({ message: '删除失败' });
    if (this.changes === 0) return res.status(404).json({ message: '学号未找到' });
    res.json({ message: '删除成功' });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行中：http://0.0.0.0:${PORT}`);
});



const express = require('express');
const app = express();

// 定义路由
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// 监听端口
const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
