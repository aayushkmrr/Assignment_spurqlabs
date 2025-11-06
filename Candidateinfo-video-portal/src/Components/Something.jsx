import React, { useRef, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Alert, ProgressBar, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MAX_DURATION = 90; // seconds
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

const Something = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [videoBlob, setVideoBlob] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState('');

  // Request camera and mic access
  useEffect(() => {
    const getMedia = async () => {
      try {
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

    // Cleanup function
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
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

  // Handle PDF upload
  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    setPdfError('');

    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file.');
      return;
    }

    // Validate file size
    if (file.size > MAX_PDF_SIZE) {
      setPdfError('PDF file size should be less than 5MB.');
      return;
    }

    setPdfFile(file);
  };

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

    const localChunks = [];

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
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  // Submit both video and PDF
  const handleSubmit = async () => {
    if (!videoBlob || !pdfFile) {
      setError('Please record a video and upload a PDF before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('videoBlob', videoBlob, 'interview-video.webm');
    formData.append('pdfFile', pdfFile, pdfFile.name);

    try {
      const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert('✅ Files uploaded successfully!');
      console.log(formData['video'], formData['pdf']);
    //   navigate('/review', {
    //     state: { videoBlob, pdfFile },
    //   });
    }} catch (err) {
      setError('Failed to upload files.');
    }
  };

  return (
    <Container className="mt-5 p-4 bg-light shadow-sm rounded" style={{ maxWidth: '700px' }}>
      <h3 className="mb-3 text-center">📄 Upload Documents & Record Video</h3>

      {/* PDF Upload Section */}
      <section className="mb-4">
        <h5>Upload PDF Document</h5>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Control 
            type="file" 
            accept=".pdf"
            onChange={handlePdfUpload}
            className="mb-2"
          />
          {pdfFile && <Alert variant="success">PDF uploaded: {pdfFile.name}</Alert>}
          {pdfError && <Alert variant="danger">{pdfError}</Alert>}
        </Form.Group>
      </section>

      <hr />

      {/* Video Recording Section */}
      <section>
        <h5 className="mb-3">Record Video Introduction</h5>
        
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

        {/* Recording Controls */}
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
        </div>

        {/* Video Preview */}
        {videoBlob && videoBlob.size > 0 && (
          <div className="mt-4 text-center">
            <h6>Recorded Video Preview:</h6>
            <video
              key={URL.createObjectURL(videoBlob)}
              controls
              preload="metadata"
              src={URL.createObjectURL(videoBlob)}
              style={{ width: '100%', borderRadius: '10px' }}
            />
          </div>
        )}
      </section>

      {/* Submit Button */}
      <div className="d-flex justify-content-center mt-4">
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={!videoBlob || !pdfFile}
          size="lg"
        >
          Submit Both Files
        </Button>
      </div>

      {/* Error message */}
      {error && <Alert variant="danger" className="mt-4 text-center">{error}</Alert>}
    </Container>
  );
};

export default Something;