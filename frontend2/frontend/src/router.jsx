import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import GetResumes from "./pages/GetResumes";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import InterviewRoom from "./pages/InterviewRoom";
import StartInterview from "./pages/StartInterview";
import InterviewList from "./pages/InterviewList";
import InterviewAnalysis from "./pages/InterviewAnalysis";
import Layout from "./components/Layout";
import ResumeAnalysisReport from "./pages/ResumeAnalysisReport";
import ResumeList from "./pages/ResumeList";

function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload-resume" element={<UploadResume />} />
        <Route path="/resumes" element={<GetResumes />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/start-interview" element={<StartInterview />} />
        <Route path="/interview/:interview_id" element={<InterviewRoom />} />
        <Route path="/interviews" element={<InterviewList />} />
        <Route
          path="/interviews/:interview_id/analysis"
          element={<InterviewAnalysis />}
        />
        <Route
          path="/resumes/analysis/:id"
          element={<ResumeAnalysisReport />}
        />
        <Route path='/resumes/analysis' element={<ResumeList />} />
      </Route>
    </Routes>
  );
}

export default Router;