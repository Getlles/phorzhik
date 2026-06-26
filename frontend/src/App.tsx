import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout/MainLayout";
import { AccountPage } from "./pages/AccountPage/AccountPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout theme="account" />}>
          <Route path="/" element={<Navigate to="/account" replace />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;