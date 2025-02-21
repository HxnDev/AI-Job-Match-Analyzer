import { FileInput, Tabs, Textarea, Text, Stack } from '@mantine/core';

const ResumeUpload = ({ setResumeFile, resumeText, setResumeText }) => {
    const handleFileChange = (file) => {
        if (file) {
            const fileType = file.name.split('.').pop().toLowerCase();
            if (!['pdf', 'txt'].includes(fileType)) {
                alert('Please upload a PDF or TXT file');
                return;
            }
            setResumeFile(file);
            setResumeText('');
        }
    };

    return (
        <Stack spacing="xs">
            <Text size="sm" weight={500}>Resume</Text>
            <Tabs defaultValue="upload">
                <Tabs.List>
                    <Tabs.Tab value="upload">Upload File</Tabs.Tab>
                    <Tabs.Tab value="text">Paste Text</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="upload" pt="xs">
                    <FileInput
                        placeholder="Upload your resume (PDF or TXT)"
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="text" pt="xs">
                    <Textarea
                        placeholder="Paste your resume text here"
                        minRows={4}
                        value={resumeText}
                        onChange={(event) => {
                            setResumeText(event.currentTarget.value);
                            setResumeFile(null);
                        }}
                    />
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
};

export default ResumeUpload;