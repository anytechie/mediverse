import { useState } from "react";
import { WebAppProvider } from "@vkruglikov/react-telegram-web-app";
import { LandingPage } from "./components/LandingPage/LandingPage";
import "./assets/bootstrap.css";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { RegisterDoctor } from "./components/RegisterDoctor/RegisterDoctor";
import { RegisterPatient } from "./components/RegisterPatient/RegisterPatient";
const App = () => {
  const location = useLocation();
  const [smoothButtonsTransition, setSmoothButtonsTransition] = useState(false);

  return (
    <WebAppProvider options={{ smoothButtonsTransition }}>
        <Routes location={location} key={location.pathname}>1
          <Route path="/" element={<LandingPage onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
          <Route path="/register_doctor" element={<RegisterDoctor onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
          <Route path="/register_patient" element={<RegisterPatient onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
        </Routes>
    </WebAppProvider>
  );
};

export default App;
