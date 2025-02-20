import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
    <MantineProvider withGlobalStyles withNormalizeCSS>
        <App />
    </MantineProvider>
);
