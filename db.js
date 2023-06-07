const mongoose = require('mongoose');
dbConnect();
async function dbConnect() {
  try {
    await mongoose.connect(
      'mongodb+srv://ProjectJob:Niraj1234@cluster0.rkqwd.mongodb.net/jobs',
      { useNewUrlParser: true }
    );
    console.log('Mongo DB Connection success');
  } catch (error) {
    console.log('Mongo DB Connection failed');
  }
}

module.exports = mongoose;
