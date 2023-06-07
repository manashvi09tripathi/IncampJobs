const express = require('express');
const app = express();
const db = require('./db.js');
const path = require('path');
const jobsRoute = require('./routes/jobsRoute');
const userRoute = require('./routes/usersRoute');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use('/api/jobs/', jobsRoute);

app.use('/api/users/', userRoute);
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './resume');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });
app.post('/single', upload.single('file'), (req, res) => {
  console.log(req.file);
  res.send('Resuem Uploaded Successfully');
});
app.listen(port, () => console.log('Node JS Server Started'));
