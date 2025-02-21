import React, { useState } from "react";

function JobInput({ jobLinks, setJobLinks }) {
    const [jobUrl, setJobUrl] = useState("");

    const handleAddJob = () => {
        if (jobUrl.trim() !== "") {
            setJobLinks([...jobLinks, jobUrl]);
            setJobUrl("");
        }
    };

    return (
        <div>
            <input
                type="text"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="Enter job posting URL"
            />
            <button onClick={handleAddJob}>Add Job</button>
        </div>
    );
}

export default JobInput;
