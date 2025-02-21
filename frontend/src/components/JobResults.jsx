import { Table, Text, Button, Stack, Badge, Modal, List, Group, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import axios from 'axios';

const JobResults = ({ results }) => {
    const [coverLetter, setCoverLetter] = useState('');
    const [opened, { open, close }] = useDisclosure(false);
    const [loading, setLoading] = useState(false);

    if (!results || results.length === 0) return null;

    const handleGenerateCoverLetter = async (jobDescription) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5050/api/cover-letter', {
                job_description: jobDescription
            });
            setCoverLetter(response.data.cover_letter);
            open();
        } catch (error) {
            console.error('Error generating cover letter:', error);
            alert('Error generating cover letter. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'yellow';
        return 'red';
    };

    return (
        <Stack spacing="md">
            <Text size="xl" weight={700}>Analysis Results</Text>

            {results.map((job, index) => (
                <Paper key={index} shadow="xs" p="md" withBorder>
                    <Stack spacing="sm">
                        {/* Job Link and Match Score */}
                        <Group position="apart" align="center">
                            <Text size="sm" style={{ maxWidth: '70%' }} lineClamp={1}>
                                {job.job_link}
                            </Text>
                            <Badge color={getScoreColor(job.match_percentage)} size="lg">
                                {job.match_percentage}% Match
                            </Badge>
                        </Group>

                        {/* Matching Skills */}
                        <div>
                            <Text weight={500} size="sm">Matching Skills:</Text>
                            <Group spacing="xs" mt="xs">
                                {job.matching_skills.map((skill, i) => (
                                    <Badge key={i} variant="dot" color="green">
                                        {skill}
                                    </Badge>
                                ))}
                            </Group>
                        </div>

                        {/* Missing Skills */}
                        <div>
                            <Text weight={500} size="sm">Skills to Develop:</Text>
                            <Group spacing="xs" mt="xs">
                                {job.missing_skills.map((skill, i) => (
                                    <Badge key={i} variant="dot" color="red">
                                        {skill}
                                    </Badge>
                                ))}
                            </Group>
                        </div>

                        {/* Recommendations */}
                        <div>
                            <Text weight={500} size="sm">Recommendations:</Text>
                            <List size="sm" mt="xs">
                                {job.recommendations.map((rec, i) => (
                                    <List.Item key={i}>{rec}</List.Item>
                                ))}
                            </List>
                        </div>

                        {/* Action Button */}
                        <Button
                            variant="light"
                            onClick={() => handleGenerateCoverLetter(job.job_link)}
                            loading={loading}
                            fullWidth
                        >
                            Generate Cover Letter
                        </Button>
                    </Stack>
                </Paper>
            ))}

            {/* Cover Letter Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title="Generated Cover Letter"
                size="lg"
            >
                <Text style={{ whiteSpace: 'pre-line' }}>{coverLetter}</Text>
                <Button onClick={close} mt="md">Close</Button>
            </Modal>
        </Stack>
    );
};

export default JobResults;