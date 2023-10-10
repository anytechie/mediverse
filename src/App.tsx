import { useState } from "react";
import { WebAppProvider } from "@vkruglikov/react-telegram-web-app";
import { LandingPage } from "./components/LandingPage/LandingPage";
import "./assets/bootstrap.css";
import {
  Routes,
  Route,
} from "react-router-dom";
import { RegisterDoctor } from "./components/RegisterDoctor/RegisterDoctor";
import { RegisterPatient } from "./components/RegisterPatient/RegisterPatient";
import { PatientDashboard } from "./components/PatientDashboard/PatientDashboard";
import { DoctorDashboard } from "./components/DoctorDashboard/DoctorDashboard";
import "./App.css";
import BookAppointment from "./components/BookAppointment/BookAppointment";
import ResolveAppointment from "./components/ResolveAppointment/ResolveAppointment";
import PastAppointmentDoctor from "./components/PastAppointmentDoctor/PastAppointmentDoctor";
import ViewAppointment from "./components/ViewAppointmentPatient/PastAppointmentPatient";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  const [smoothButtonsTransition, setSmoothButtonsTransition] = useState(false);
  return (
    <AuthProvider>
      <WebAppProvider options={{ smoothButtonsTransition }}>
          <Routes>
            <Route path="/" element={<LandingPage onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
            <Route path="/register_doctor" element={<RegisterDoctor onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
            <Route path="/register_patient" element={<RegisterPatient onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
            <Route path="/patient_dashboard" element={<PatientDashboard onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
            <Route path="/doctor_dashboard" element={<DoctorDashboard onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
            <Route path="/book_appointment/:doctorId" element={<BookAppointment onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
            <Route path="/resolve_appointment/:appointmentId" element={<ResolveAppointment onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
            <Route path="/past_appointment_doctor/:appointmentId" element={<PastAppointmentDoctor onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
            <Route path="/past_appointment_patient/:appointmentId" element={<ViewAppointment onChangeTransition={() => setSmoothButtonsTransition(true)} />} />
          </Routes>
      </WebAppProvider>
    </AuthProvider>
  );
};

export default App;
