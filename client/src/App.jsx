import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../Context/AuthContext";

const App = () => {
  const { authUser } = useContext(AuthContext);
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-cover">
      <div>
        <Toaster />
        <Routes>
          <Route
            path="/"
            element={authUser ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={authUser ? <Profile /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
