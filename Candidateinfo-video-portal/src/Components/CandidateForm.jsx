import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

import { Form, Button, Container, Alert } from 'react-bootstrap';

const CandidateForm = ({ onNext }) => {
    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    positionApplied: '',
    currentPosition: '',
    experience: '',
    resume: null,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'resume') {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.positionApplied.trim()) newErrors.positionApplied = 'Position is required';
    if (!formData.currentPosition.trim()) newErrors.currentPosition = 'Current position is required';
    if (!formData.experience || isNaN(formData.experience))
      newErrors.experience = 'Experience (in years) is required';
    
    if (!formData.resume) {
      newErrors.resume = 'Resume is required';
    } else {
      const file = formData.resume;
      const isPDF = file.type === 'application/pdf';
      const isUnder5MB = file.size <= 5 * 1024 * 1024; // 5 MB limit

      if (!isPDF) newErrors.resume = 'Only PDF files are allowed';
      else if (!isUnder5MB) newErrors.resume = 'File size must not exceed 5 MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      console.log('Form Data:', formData);
        navigate("/record-video", {
      state: { formData, resumeFile: formData.resume},
    });
      // Go to next page
      if (onNext) onNext(formData);
    } else {
      setSubmitted(false);
    }
  };

  return (
    <Container className="mt-5 p-4 shadow-sm rounded bg-light" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4 text-center">Candidate Information</h2>
      <Form onSubmit={handleSubmit} noValidate>
        {/* First Name */}
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleChange}
            isInvalid={!!errors.firstName}
          />
          <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
        </Form.Group>

        {/* Last Name */}
        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleChange}
            isInvalid={!!errors.lastName}
          />
          <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
        </Form.Group>

        {/* Position Applied */}
        <Form.Group className="mb-3">
          <Form.Label>Position Applied For</Form.Label>
          <Form.Control
            type="text"
            name="positionApplied"
            placeholder="Enter position applied for"
            value={formData.positionApplied}
            onChange={handleChange}
            isInvalid={!!errors.positionApplied}
          />
          <Form.Control.Feedback type="invalid">{errors.positionApplied}</Form.Control.Feedback>
        </Form.Group>

        {/* Current Position */}
        <Form.Group className="mb-3">
          <Form.Label>Current Position</Form.Label>
          <Form.Control
            type="text"
            name="currentPosition"
            placeholder="Enter your current position"
            value={formData.currentPosition}
            onChange={handleChange}
            isInvalid={!!errors.currentPosition}
          />
          <Form.Control.Feedback type="invalid">{errors.currentPosition}</Form.Control.Feedback>
        </Form.Group>

        {/* Experience */}
        <Form.Group className="mb-3">
          <Form.Label>Experience (in Years)</Form.Label>
          <Form.Control
            type="number"
            name="experience"
            placeholder="Enter total years of experience"
            value={formData.experience}
            onChange={handleChange}
            isInvalid={!!errors.experience}
          />
          <Form.Control.Feedback type="invalid">{errors.experience}</Form.Control.Feedback>
        </Form.Group>

        {/* Upload Resume */}
        <Form.Group className="mb-3">
          <Form.Label>Upload Resume (PDF, ≤ 5 MB)</Form.Label>
          <Form.Control
            type="file"
            name="resume"
            accept=".pdf"
            onChange={handleChange}
            isInvalid={!!errors.resume}
          />
          <Form.Control.Feedback type="invalid">{errors.resume}</Form.Control.Feedback>
        </Form.Group>

        {/* Submit */}
        <div className="text-center">
          <Button type="submit" variant="primary" onClick={()=>console.log(formData)}>Next</Button>
        </div>

        {/* Success Message */}
        {submitted && (
          <Alert variant="success" className="mt-4 text-center">
            ✅ Form validated successfully! Proceeding to next page...
          </Alert>
        )}
      </Form>
    </Container>
  );
};

export default CandidateForm;
