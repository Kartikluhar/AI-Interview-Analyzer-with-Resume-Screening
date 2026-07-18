import { BrowserRouter } from "react-router-dom";
import Router from "./router";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Router />
    </BrowserRouter>
  );
}

export default App;