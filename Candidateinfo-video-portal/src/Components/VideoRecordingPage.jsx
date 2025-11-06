import React, { useRef, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Alert, ProgressBar } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

const MAX_DURATION = 90; // seconds

const VideoRecordingPage = ({ onSubmit }) => {
  const location = useLocation();
  const { formData, resumeFile } = location.state || {};
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [videoBlob, setVideoBlob] = useState(null);

  // Request camera and mic access
  useEffect(() => {
    const getMedia = async () => {
      try {
        console.log(formData, resumeFile);
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Camera and microphone access is required to record video.');
      }
    };
    getMedia();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (recording) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t + 1 > MAX_DURATION) {
            handleStopRecording();
            setError('Recording stopped — duration limit (90s) exceeded.');
            return MAX_DURATION;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recording]);

  // Start recording
  const handleStartRecording = () => {
    if (!stream) {
      setError('Camera not available.');
      return;
    }

    setError('');
    setTimer(0);
    setVideoBlob(null);

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;

    const localChunks = []; // local array (avoids async state issues)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        localChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const completeBlob = new Blob(localChunks, { type: 'video/webm' });
      console.log('✅ Final Blob created:', completeBlob);
      setVideoBlob(completeBlob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      // Stop camera and mic
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  // Submit video to backend or next page
  const handleSubmit = async () => {
    if (!videoBlob) {
      setError('Please record a video before submitting.');
      return;
    }

    const data = new FormData();
    data.append('video', videoBlob, 'interview-video.webm');

    try {
      // Example API call (disabled for now)
      // const response = await fetch('https://your-api.com/upload-video', {
      //   method: 'POST',
      //   body: data,
      // });
      // const result = await response.json();
      // console.log('Upload success:', result);

      if (onSubmit) onSubmit(videoBlob);
      alert('✅ Video recorded and ready for review page!');
      navigate('/review', {
        state: { formData, resumeFile, videoBlob },
      });
    } catch (err) {
      setError('Failed to upload video.');
    }
  };

  return (
    <Container className="mt-5 p-4 bg-light shadow-sm rounded" style={{ maxWidth: '700px' }}>
      <h3 className="mb-3 text-center">🎥 Video Recording Instructions</h3>

      <ul>
        <li>A brief introduction about yourself</li>
        <li>Why are you interested in this position?</li>
        <li>Highlight your relevant experience</li>
        <li>Your long-term career goals</li>
      </ul>

      <hr />

      {/* Live video preview */}
      <div className="text-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="border rounded"
          style={{ width: '100%', maxHeight: '320px', backgroundColor: '#000' }}
        />
      </div>

      {/* Timer + Progress */}
      <div className="d-flex align-items-center justify-content-between mt-3">
        <span>⏱️ {timer}s / {MAX_DURATION}s</span>
        <ProgressBar now={(timer / MAX_DURATION) * 100} style={{ flexGrow: 1, marginLeft: '10px' }} />
      </div>

      {/* Buttons */}
      <div className="d-flex justify-content-center gap-3 mt-4">
        {!recording ? (
          <Button variant="success" onClick={handleStartRecording}>
            ▶️ Start Recording
          </Button>
        ) : (
          <Button variant="danger" onClick={handleStopRecording}>
            ⏹️ Stop Recording
          </Button>
        )}

        <Button variant="primary" onClick={handleSubmit} disabled={!videoBlob}>
          Submit
        </Button>
      </div>

      {/* Error message */}
      {error && <Alert variant="danger" className="mt-4 text-center">{error}</Alert>}

      {/* Preview of recorded video */}
      {videoBlob && videoBlob.size > 0 && (
        <div className="mt-4 text-center">
          <h6>Recorded Video Preview:</h6>
          <video
            key={URL.createObjectURL(videoBlob)} // ensures fresh render
            controls
            preload="metadata"
            src={URL.createObjectURL(videoBlob)}
            style={{ width: '100%', borderRadius: '10px' }}
          />
        </div>
      )}
    </Container>
  );
};

export default VideoRecordingPage;
