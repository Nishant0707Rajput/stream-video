import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path'
import morgan from 'morgan';
import fs from "fs";
import { exec } from "child_process";
const app = express();

app.use(morgan('dev'))
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        console.log(">>>");
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        console.log("<<<<<");
        cb(null, file.fieldname + '-' + uuidv4() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

app.use(
    cors({
        origin: ['https://localhost:4200']
    })
)

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// app.use((req,res,next)=>{

// })
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static('uploads'))

app.get('/', function (req, res) {
    res.json({ message: 'Hello' });
})

app.post("/upload", upload.single('file'), function (req, res) {
    const lessonId = uuidv4();
    const videoPath = req.file.path;
    const outputPath = `./uploads/course/${lessonId}`;
    const hlsPath = `${outputPath}/index.m3u8`;

    // if the output directory doesn't exist, create it
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // command to convert video to HLS format using ffmpeg

    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    // run the ffmpeg command; usually done in a separate process (queued)
    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.json({
                message: 'Internal server error.'
            });
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        const videoUrl = `http://localhost:3000/uploads/course/${lessonId}/index.m3u8`;
        res.json({
            message: "Video converted to HLS format",
            videoUrl: videoUrl,
            lessonId: lessonId,
        });
    });
});


app.listen(3000, function () {
    console.log("App is listening at port 3000...")
})