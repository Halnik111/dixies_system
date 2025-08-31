import './App.css';
import {HashRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Tables from "./pages/Tables";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Order from "./pages/Order";
import Print from "./pages/Print";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import NoAccess from "./components/NoAccess";

const App = () => {


    return (
        <div className={'app'}>
            <Navbar />
            <div className={'wrapper'}>
                <Routes>
                    <Route path={"/"}>
                        <Route path={'login'} element={<Login />}/>
                        <Route path={'noAccess'} element={<NoAccess />} />
                        <Route index element={
                            <ProtectedRoute allowedRoles={["Admin", "Manager" ,"User"]}>
                                <Home />
                            </ProtectedRoute>}
                        />
                        <Route path={'tables'} element={
                            <ProtectedRoute allowedRoles={["Admin", "Manager" ,"User"]}>
                                <Tables />
                            </ProtectedRoute>}
                        />
                        <Route path={'order'} element={
                            <ProtectedRoute allowedRoles={["Admin", "Manager" ,"User"]}>
                                <Order />
                            </ProtectedRoute>}
                        />
                        <Route path={'print'} element={
                            <ProtectedRoute allowedRoles={["Admin", "Manager" ,"User"]}>
                                <Print />
                            </ProtectedRoute>}
                        />
                        <Route path={'dashboard'} element={
                            <ProtectedRoute allowedRoles={["Admin"]}>
                                <Dashboard />
                            </ProtectedRoute>}
                        />
                        <Route path={'settings'} element={
                            <ProtectedRoute allowedRoles={["Admin"]}>
                                <Settings />
                            </ProtectedRoute>}
                        />
                    </Route>
                </Routes>
            </div>
        </div>
    );
}

export default App;
