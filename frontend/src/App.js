import React from "react";
import { MantineProvider, Container, Title } from "@mantine/core";
import JobInput from "./components/JobInput";
import ResumeUpload from "./components/ResumeUpload";
import JobResults from "./components/JobResults";

function App() {
  return (
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Container>
          <Title align="center" my="md">
            Job Match Analyzer
          </Title>
          <ResumeUpload />
          <JobInput />
          <JobResults />
        </Container>
      </MantineProvider>
  );
}

export default App;
