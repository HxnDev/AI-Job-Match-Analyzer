import React, { useState } from 'react';
import { Textarea, Group, Badge, Stack } from '@mantine/core';

const JobInput = ({ jobLinks, setJobLinks }) => {
    const [inputValue, setInputValue] = useState('');

    const parseLinks = (input) => {
        const separators = /[,\n\t\s]+/;
        const links = input.split(separators).map(link => link.trim()).filter(link => link !== '');
        return links;
    };

    const handleInputChange = (e) => {
        const newInput = e.currentTarget.value;
        const parsed = parseLinks(newInput);
        if (parsed.length > 0) {
            const uniqueLinks = parsed.filter(link => !jobLinks.includes(link));
            if (uniqueLinks.length > 0) {
                setJobLinks([...jobLinks, ...uniqueLinks]);
                setInputValue('');
            } else {
                setInputValue(newInput);
            }
        } else {
            setInputValue(newInput);
        }
    };

    const handleRemoveLink = (linkToRemove) => {
        const updatedLinks = jobLinks.filter(link => link !== linkToRemove);
        setJobLinks(updatedLinks);
    };

    return (
        <Stack mt="md">
            <Textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter job posting links separated by comma, space, tab or return"
                label="Job Posting Links"
                autosize
                minRows={2}
            />
            {jobLinks.length > 0 && (
                <Group mt="xs" spacing="xs">
                    {jobLinks.map((link, index) => (
                        <Badge key={index} variant="outline" onClick={() => handleRemoveLink(link)} style={{ cursor: 'pointer' }}>
                            {link} &times;
                        </Badge>
                    ))}
                </Group>
            )}
        </Stack>
    );
};

export default JobInput;
