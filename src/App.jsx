import '@fortawesome/fontawesome-free/css/all.min.css';
import { Route, Routes } from "react-router-dom";

// Routes
import Home from "./routes/Home";
import About from "./routes/About";
import Service from "./routes/Service";
import HowItWorks from "./routes/HowItWorks";

// Auth Forms
import SignUp from "./components/SignForm/SignUp/SignUp";
import SignIn from "./components/SignForm/SignIn/SignIn";
import ForgotPassword from "./components/SignForm/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "./components/SignForm/ResetPassword/ResetPassword.jsx";

// Protected Pages
import MainChatbot from "./components/ChatBot/MainChatBot/MainChatbot";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AnxietyModule from "./components/ChatBot/modules/SpecializedModule/AnxietyModule";
import DepressionModule from "./components/ChatBot/modules/SpecializedModule/DepressionModule";
import OCDModule from "./components/ChatBot/modules/SpecializedModule/OCDModule";
import BipolarModule from "./components/ChatBot/modules/SpecializedModule/BipolarModule";
import PhobiasModule from "./components/ChatBot/modules/SpecializedModule/PhobiasModule";
import GeneralModule from "./components/ChatBot/modules/GeneralModule";
import Profile from "./components/Profile/Profile.jsx";
import FeedbackForm from "./components/Feedback/FeedbackForm.jsx";

// Layout & Guards
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/Auth/PublicOnlyRoute.jsx";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Fully Public Routes — accessible to anyone */}
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="service" element={<Service />} />
        <Route path="howitworks" element={<HowItWorks />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Auth-Only Routes — redirect to /chat if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="signup" element={<SignUp />} />
          <Route path="signin" element={<SignIn />} />
        </Route>

        {/* Protected Routes — need login, wrapped in Layout (sidebar + header) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="chat" element={<MainChatbot />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="general" element={<GeneralModule />} />
            <Route path="anxiety" element={<AnxietyModule />} />
            <Route path="depression" element={<DepressionModule />} />
            <Route path="ocd" element={<OCDModule />} />
            <Route path="bipolar" element={<BipolarModule />} />
            <Route path="phobias" element={<PhobiasModule />} />
            <Route path="feedback" element={<FeedbackForm />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;