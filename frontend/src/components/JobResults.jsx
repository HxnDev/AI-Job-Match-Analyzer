import React from "react";

function JobResults({ results }) {
    if (!results) return null;

    return (
        <div>
            <h2>Analysis Results</h2>
            <table border="1">
                <thead>
                <tr>
                    <th>Job Link</th>
                    <th>AI Score</th>
                    <th>AI Comments</th>
                </tr>
                </thead>
                <tbody>
                {results.map((job, index) => (
                    <tr key={index}>
                        <td>{job.job_link}</td>
                        <td>{job.score}</td>
                        <td>{job.comment}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default JobResults;
