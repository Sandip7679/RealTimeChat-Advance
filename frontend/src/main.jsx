import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";

// import process from "process";
// import { Buffer } from "buffer";

// window.process = process;
// window.Buffer = Buffer;

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </StrictMode>
);
