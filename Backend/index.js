const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const app = express();
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const {GridFSBucket} = require('mongodb');
const fs = require('fs');

app.use(cors());

const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfsBucket;
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected");
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
});

// Use Multer to temporarily store files before streaming to GridFS
const upload = multer({ dest: "tempUploads/" });

const candidateSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  position: String,
  currentPosition: String,
  experience: Number,
  resumeFileName: String,
  videoFileName: String,
  createdAt: { type: Date, default: Date.now },
});

const Candidate = mongoose.model("Candidate", candidateSchema,'candidatedata');

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.post('/submitdata', (req, res) => {
    const {name}= req.body;
    console.log(name);
    res.status(200).send({message: 'Data received successfully'});
})

app.post('/addcandidate', async (req, res) => {
    const {firstname, lastname} = req.body;
    if(!firstname || !lastname){
        return res.status(400).send({message: 'Firstname and Lastname are required'});
    }
    try{
        const newCandidate = new candidate({firstname, lastname});
        await newCandidate.save();
        res.status(201).send({message: 'Candidate added successfully'});
    } catch (error) {
        console.error('Error adding candidate:', error);
        res.status(500).send({message: 'Internal server error'});
    }
})

app.post(
  "/upload",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Text fields from FormData
      const { firstName, lastName, position, currentPosition, experience } = req.body;

      // Files info (saved in MongoDB via GridFS)
      const resumeFile = req.files["resume"] ? req.files["resume"][0] : null;
      const videoFile = req.files["video"] ? req.files["video"][0] : null;


       const candidate = new Candidate({
        firstName,
        lastName,
        position,
        currentPosition,
        experience,
        resumeFileName: resumeFile?.filename || null,
        videoFileName: videoFile?.filename || null,
      });

      await candidate.save();

      console.log("Received data:");
      console.log({ firstName, lastName, position, currentPosition, experience });
      console.log("Resume:", resumeFile?.filename);
      console.log("Video:", videoFile?.filename);

      res.status(200).json({
        message: "Upload successful",
        resume: resumeFile ? resumeFile.filename : null,
        video: videoFile ? videoFile.filename : null,
      });
    } catch (error) {
      console.error("Error uploading:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

