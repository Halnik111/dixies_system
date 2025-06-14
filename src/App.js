import './App.css';
import {HashRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Tables from "./pages/Tables";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Order from "./pages/Order";
import Print from "./pages/Print";
import Dashboard from "./pages/Dashboard";

const App = () => {


    return (
        <HashRouter>
            <div className={'app'}>
                <Navbar />
                <div className={'wrapper'}>
                    <Routes>
                        <Route path={"/"}>
                            <Route index element={<Home />}/>
                            <Route path={'tables'} element={<Tables />}/>
                            <Route path={'login'} element={<Login />}/>
                            <Route path={'order'} element={<Order />}/>
                            <Route path={'print'} element={<Print />}/>
                            <Route path={'dashboard'} element={<Dashboard />}/>
                        </Route>
                    </Routes>
                </div>
            </div>
        </HashRouter>
    );
}

export default App;
