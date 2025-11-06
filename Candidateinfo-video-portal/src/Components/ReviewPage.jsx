import React, { useEffect } from "react";
import { Button, Card } from "react-bootstrap";
import { useLocation,useNavigate } from "react-router-dom"; 

const ReviewPage = ({onSubmit }) => {
  const location = useLocation();
  const { formData, resumeFile, videoBlob } = location.state || {};
  
  if (!formData || !resumeFile || !videoBlob) {
    return <p className="text-center mt-4 text-danger">Missing candidate data. Please go back and fill all steps.</p>;
  }

  const { firstName, lastName, position, currentPosition, experience } = formData;

  const handleSubmit = () => {
    // Prepare final form data for backend upload
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("position", position);
    formData.append("currentPosition", currentPosition);
    formData.append("experience", experience);
    formData.append("resume", resumeFile);
    formData.append("video", videoBlob, "interview-video.webm");

    // Send to backend API
    fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to submit");
        alert("Application submitted successfully!");
        if (onSubmit) onSubmit();
      })
      .catch((err) => alert("Error submitting data: " + err.message));
    console.log(formData,resumeFile,videoBlob);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <Card className="shadow p-4 rounded-4">
        <h3 className="mb-4 text-center text-primary">Review Your Information</h3>

        <div className="mb-4">
          <h5 className="text-secondary">Candidate Details</h5>
          <p><strong>First Name:</strong> {firstName}</p>
          <p><strong>Last Name:</strong> {lastName}</p>
          <p><strong>Position Applied For:</strong> {position}</p>
          <p><strong>Current Position:</strong> {currentPosition}</p>
          <p><strong>Experience (Years):</strong> {experience}</p>
        </div>

        <hr />

        <div className="mb-4">
          <h5 className="text-secondary">Uploaded Resume</h5>
          <a
            href={URL.createObjectURL(resumeFile)}
            download={resumeFile.name}
            className="btn btn-outline-primary"
          >
            📄 Download Resume
          </a>
        </div>

        <div className="mb-4">
          <h5 className="text-secondary">Recorded Video</h5>
          <video
            controls
            src={URL.createObjectURL(videoBlob)}
            style={{ width: "100%", borderRadius: "10px" }}
          />
        </div>

        <div className="d-flex justify-content-center">
          <Button variant="success" onClick={handleSubmit} className="px-4">
            Submit Application
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReviewPage;
