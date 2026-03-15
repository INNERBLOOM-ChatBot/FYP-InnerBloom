import { Route, Routes } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Home from "./routes/Home"
import About from "./routes/About"
import Service from "./routes/Service"
import HowItWorks from "./routes/HowItWorks"
import SignUp from "./components/SignForm/SignUp/SignUp";
import SignIn from "./components/SignForm/SignIn/SignIn";
import MainChatbot from "./components/ChatBot/MainChatBot/MainChatbot";
import AnxietyModule from "./components/ChatBot/modules/SpecializedModule/AnxietyModule";
import DepressionModule from "./components/ChatBot/modules/SpecializedModule/DepressionModule";
import OCDModule from "./components/ChatBot/modules/SpecializedModule/OCDModule";
import BipolarModule from "./components/ChatBot/modules/SpecializedModule/BipolarModule";
import PhobiasModule from "./components/ChatBot/modules/SpecializedModule/PhobiasModule";
import GeneralModule from "./components/ChatBot/modules/GeneralModule";



function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={ <Home/>}/>
        <Route path="/general" element={<GeneralModule />} />
        <Route path="/about" element={ <About/>}/>
        <Route path="/service" element={ <Service/>}/>
        <Route path="/howitworks" element={ <HowItWorks/>}/>
        <Route path="/signup" element={ <SignUp/>}/>
        <Route path="/signin" element={ <SignIn/>}/>
        <Route path="/chat" element={ <MainChatbot/>}/>
        <Route path="/general" element={ <GeneralModule/>}/>
        <Route path="/anxiety" element={ <AnxietyModule/>}/>
        <Route path="/depression" element={ <DepressionModule/>}/>
        <Route path="/ocd" element={ <OCDModule/>}/>
        <Route path="/bipolar" element={ <BipolarModule/>}/>
        <Route path="/phobias" element={ <PhobiasModule/>}/>

        <Route path="*" element={<NotFound />} />
        
       
       
       


       
       
      </Routes>

     
        
    </div>
  );
}

export default App;