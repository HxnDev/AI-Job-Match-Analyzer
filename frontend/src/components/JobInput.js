import React, { useState } from "react";
import { TextInput, Button, Stack } from "@mantine/core";

const JobInput = ({ onAddLinks }) => {
    const [jobLinks, setJobLinks] = useState([""]);

    const handleAddLink = () => setJobLinks([...jobLinks, ""]);

    const handleChange = (index, value) => {
        const updatedLinks = [...jobLinks];
        updatedLinks[index] = value;
        setJobLinks(updatedLinks);
    };

    return (
        <Stack>
            {jobLinks.map((link, index) => (
                <TextInput
                    key={index}
                    placeholder="Enter job posting link"
                    value={link}
                    onChange={(e) => handleChange(index, e.target.value)}
                />
            ))}
            <Button onClick={handleAddLink} variant="light">
                + Add Another Link
            </Button>
        </Stack>
    );
};

export default JobInput;
