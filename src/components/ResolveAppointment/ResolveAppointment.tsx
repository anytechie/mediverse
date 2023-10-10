import { useState, useEffect, FC, DispatchWithoutAction } from "react";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import StyledTextField from "../StyledTextField/StyledTextField";
import Patient from "../../assets/patient.png";
import "./ResolveAppointment.scss";

export const ResolveAppointment: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const navigate = useNavigate();
  const [colorScheme, themeParams] = useThemeParams();

  useEffect(() => {
    const fetchAppointment = async () => {
      const appointmentRef = doc(db, "appointments", appointmentId);
      const appointmentSnap = await getDoc(appointmentRef);
      if (appointmentSnap.exists()) {
        setAppointment(appointmentSnap.data());
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  useEffect(() => {
    const handleBackButtonClick = () => {
      navigate(-1);
    };
    window.Telegram.WebApp.onEvent("backButtonClicked", handleBackButtonClick);
    window.Telegram.WebApp.BackButton.show();
    return () => {
      window.Telegram.WebApp.offEvent(
        "backButtonClicked",
        handleBackButtonClick
      );
      window.Telegram.WebApp.BackButton.hide();
    };
  }, [navigate]);

  useEffect(() => {
    const handleResolve = async () => {
      const appointmentRef = doc(db, "appointments", appointmentId);
      try {
        await updateDoc(appointmentRef, {
          diagnosis,
          treatment,
          done: true,
        });

        const doctorId = appointment.doctorId;
        const patientId = appointment.patientId;
        await addDoc(collection(db, "messages"), {
          userId: doctorId,
          content: `The appointment for *${appointment.patientName}* has been resolved successfully`,
        });

        await addDoc(collection(db, "messages"), {
          userId: patientId,
          content: `Your appointment with *Dr. ${appointment.doctorName}* has been resolved successfully. Please find the diagnosis and treatment below:\n\nDiagnosis: ${diagnosis}\n\nTreatment: ${treatment}`,
        });
      } catch (error) {
        console.log(error);
        window.Telegram.WebApp.showAlert("Error resolving appointment");
      }

      window.Telegram.WebApp.showPopup({
        title: "Appointment Resolved",
        message: "Appointment has been resolved successfully",
        buttons: [{ type: "ok" }],
      });
      navigate("/doctor_dashboard");
    };
    window.Telegram.WebApp.MainButton.setText("RESOLVE");
    window.Telegram.WebApp.MainButton.onClick(handleResolve);
    return () => {
      window.Telegram.WebApp.MainButton.offClick(handleResolve);
    };
  }, [
    appointment?.doctorId,
    appointment?.doctorName,
    appointment?.patientId,
    appointment?.patientName,
    appointmentId,
    diagnosis,
    navigate,
    treatment,
  ]);

  useEffect(() => {
    window.Telegram.WebApp.MainButton.show();
    return () => {
      window.Telegram.WebApp.MainButton.hide();
    };
  }, []);

  return (
    <ConfigProvider
      theme={
        themeParams.text_color
          ? {
              algorithm:
                colorScheme === "dark"
                  ? theme.darkAlgorithm
                  : theme.defaultAlgorithm,
              token: {
                colorText: themeParams.text_color,
                colorPrimary: themeParams.button_color,
                colorBgBase: themeParams.bg_color,
              },
            }
          : undefined
      }
    >
      <div className="resolve_appointment">
        {appointment && (
          <>
            <img src={Patient} alt="patient" />
            <h2>{appointment.patientName}</h2>
            <p>Date: {appointment.date}</p>
            <p>Time: {appointment.slot}</p>
            <p>Problem: {appointment.description}</p>
            <StyledTextField
              label="Diagnosis"
              multiline
              rows={4}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              fullWidth
            />
            <StyledTextField
              label="Treatment"
              value={treatment}
              multiline
              rows={4}
              onChange={(e) => setTreatment(e.target.value)}
              fullWidth
            />
          </>
        )}
      </div>
    </ConfigProvider>
  );
};

export default ResolveAppointment;
