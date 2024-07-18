import './App.css';
import {HashRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Tables from "./pages/Tables";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Order from "./pages/Order";

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
                        </Route>
                    </Routes>
                </div>
            </div>
        </HashRouter>
    );
}

export default App;
