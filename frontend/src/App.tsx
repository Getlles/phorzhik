import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout/MainLayout";
import { AccountPage } from "./pages/AccountPage/AccountPage";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { EditorPage } from "./pages/EditorPage/EditorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout theme="login" />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        
        <Route element={<MainLayout theme="auth" />}>
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<MainLayout theme="account" />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>

        <Route element={<MainLayout theme="edit" />}>
          <Route path="/editor" element={<EditorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;