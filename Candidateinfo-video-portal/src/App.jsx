import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {Button} from 'react-bootstrap';
import CandidateForm from './Components/CandidateForm';
import VideoRecordingPage from './Components/VideoRecordingPage';
import ReviewPage from './Components/ReviewPage';
import Something from './Components/Something';

function App() {
 return(
  <BrowserRouter>
  <Routes>
    <Route path='/' element={<CandidateForm />} />
    <Route path='/record-video' element={<VideoRecordingPage />} />
    <Route path='/review' element={<ReviewPage />} />
  </Routes>
  </BrowserRouter>

 )
}

export default App
