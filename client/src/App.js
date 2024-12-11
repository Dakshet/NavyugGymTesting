import './App.css';
import Waiting from './Pages/Waiting';
import Home from './Pages/Home';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation

} from "react-router-dom"
import AdminLogin from './Pages/AdminLogin';
import AdminPannel from './Pages/AdminPannel';
import Navbar from './Components/Navbar';
import GymState from './context/Gym/GymState';
import DeadlinePannel from './Pages/DeadlinePannel';
import AdminHome from './Pages/AdminHome';
import SearchResult from './Pages/SearchResult';
import SubscriptionEnd from './Pages/SubscriptionEnd';
import Footer from './Components/Footer';
import MonthTimer from './Components/MonthTimer';
import ScrollToTop from './Components/ScrollToTop';
import MembersData from './Pages/MembersData';
// import TestingPage from './Pages/TestingPage';

function App() {
  return (
    <GymState>
      <div>
        <Router>
          <Navbar />
          <ScrollToTop />
          <Routes>

            <Route path='/' element={<Home />} />
            <Route path='/user/home' element={<Waiting />} />
            <Route path='/admin' element={<AdminLogin />} />
            <Route path='/admin/home' element={<AdminHome />} />
            <Route path='/admin/add/panel' element={<AdminPannel />} />
            <Route path='/admin/membership/data' element={<MembersData />} />
            <Route path='/admin/membership/panel' element={<DeadlinePannel />} />
            <Route path='/admin/search/result' element={<SearchResult />} />
            <Route path='/admin/membership/end' element={<SubscriptionEnd />} />

            {/* <Route path='/' element={<TestingPage />} /> */}
          </Routes>
          <ConditionalMonthTimer />
          <Footer />
        </Router>
      </div>
    </GymState>
  );
}


// Helper component to conditionally display MonthTimer
function ConditionalMonthTimer() {
  const location = useLocation();
  const hideOnRoutes = ['/admin/home', '/admin/add/panel', '/admin/membership/data', '/admin/membership/panel', '/admin/search/result', '/admin/membership/end']; // Routes where MonthTimer should be display

  return hideOnRoutes.includes(location.pathname) && <MonthTimer />;
}

export default App;
