import React, { useState } from "react";
import JobInput from "../components/JobInput";
import JobResults from "../components/JobResults";
import ResumeUpload from "../components/ResumeUpload";
import axios from "axios";

function Home() {
    const [jobLinks, setJobLinks] = useState([]);
    const [resumeFile, setResumeFile] = useState(null);
    const [analysisResults, setAnalysisResults] = useState(null);

    const handleAnalyze = async () => {
        if (!resumeFile || jobLinks.length === 0) {
            alert("Please upload a resume and add job links!");
            return;
        }

        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("jobs", JSON.stringify(jobLinks));

        try {
            const response = await axios.post("http://localhost:5001/api/analyze", formData);
            setAnalysisResults(response.data);
        } catch (error) {
            console.error("Error analyzing resume:", error);
            alert("Failed to analyze resume");
        }
    };

    return (
        <div>
            <h1>Job Match Analyzer</h1>
            <ResumeUpload setResumeFile={setResumeFile} />
            <JobInput jobLinks={jobLinks} setJobLinks={setJobLinks} />
            <button onClick={handleAnalyze}>Analyze Resume</button>
            <JobResults results={analysisResults} />
        </div>
    );
}

export default Home;
