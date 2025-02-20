import React, { useState } from "react";
import { Container, Title } from "@mantine/core";
import ResumeUpload from "../components/ResumeUpload";
import JobInput from "../components/JobInput";
import JobResults from "../components/JobResults";

const Home = () => {
    const [resumeText, setResumeText] = useState("");

    return (
        <Container>
            <Title align="center" my="md">
                Job Match Analyzer
            </Title>
            <ResumeUpload onUpload={setResumeText} />
            <JobInput />
            <JobResults resumeText={resumeText} />
        </Container>
    );
};

export default Home;
