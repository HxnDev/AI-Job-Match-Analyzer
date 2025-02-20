import React from 'react';
import { Table, Button } from '@mantine/core';

const JobResults = ({ results, onGenerateCoverLetter }) => {
    const rows = results.map((result, index) => (
        <tr key={index}>
            <td><a href={result.jobLink} target="_blank" rel="noreferrer">{result.jobLink}</a></td>
            <td>{result.aiScore !== null ? result.aiScore : 'N/A'}</td>
            <td>{result.aiComments}</td>
            <td>
                <Button onClick={() => onGenerateCoverLetter(result.jobLink)}>Generate Cover Letter</Button>
            </td>
        </tr>
    ));

    return (
        <Table highlightOnHover mt="md">
            <thead>
            <tr>
                <th>Job Link</th>
                <th>AI Score</th>
                <th>AI Comments</th>
                <th>Cover Letter</th>
            </tr>
            </thead>
            <tbody>{rows}</tbody>
        </Table>
    );
};

export default JobResults;
