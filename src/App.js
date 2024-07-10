import './App.css';
import {HashRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Order from "./pages/Order";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";

const App = () => {


    return (
        <HashRouter>
            <div className={'app'}>
                <Navbar />
                <div className={'wrapper'}>
                    <Routes>
                        <Route path={"/"}>
                            <Route index element={<Home />}/>
                            <Route path={'order'} element={<Order />}/>
                            <Route path={'login'} element={<Login />}/>
                        </Route>
                    </Routes>
                </div>
            </div>
        </HashRouter>
    );
}

export default App;
