import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import Home from "./pages/Home";

function App() {
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </Router>
        </MantineProvider>
    );
}

export default App;
