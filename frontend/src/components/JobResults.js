import React, { useState } from "react";
import { Table, Button, Stack } from "@mantine/core";
import axios from "axios";

const JobResults = () => {
    const [jobs, setJobs] = useState([]);

    const handleAnalyzeJobs = async () => {
        // Simulate API call
        const response = await axios.post("http://localhost:8000/analyze", {
            resume: "sample_resume.txt",
            job_links: ["https://example.com/job1", "https://example.com/job2"],
        });

        setJobs(response.data.job_analysis);
    };

    return (
        <Stack>
            <Button onClick={handleAnalyzeJobs}>Analyze Jobs</Button>
            {jobs.length > 0 && (
                <Table>
                    <thead>
                    <tr>
                        <th>Job</th>
                        <th>Match Score</th>
                        <th>Missing Skills</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {jobs.map((job, index) => (
                        <tr key={index}>
                            <td>{job.title}</td>
                            <td>{job.match_score}/10</td>
                            <td>{job.missing_skills.join(", ")}</td>
                            <td>
                                <Button>Generate Cover Letter</Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </Stack>
    );
};

export default JobResults;
