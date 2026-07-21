const mongoose = require('mongoose');
const { CandidateProfile } = require('./models/CandidateProfile');

const uri = "mongodb+srv://thiganthworkspace02_db_user:5EjPr1gvUwBJG8OM@cluster0.lw8lapo.mongodb.net/";

async function run() {
  try {
    await mongoose.connect(uri);
    const candidates = await CandidateProfile.find().sort({ createdAt: -1 }).limit(5);
    console.log("Recent candidates:");
    console.log(JSON.stringify(candidates, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}
run();

