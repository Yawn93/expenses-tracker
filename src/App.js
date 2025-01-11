import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Auth } from "./pages/auth/index.jsx";
import { Expenses } from "./pages/expense-tracker/index.jsx";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact element={<Auth />} />
          <Route path="/expense-tracker" element={<Expenses />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
