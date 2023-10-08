import { useState, useEffect, FC, DispatchWithoutAction } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";

export const PastAppointmentPatient: FC<{
    onChangeTransition: DispatchWithoutAction;
  }> = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
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
      <div className="past_appointment">
        {appointment && (
          <>
            <h2>Patient: {appointment.patientName}</h2>
            <p>Date: {appointment.date}</p>
            <p>Time: {appointment.slot}</p>
            <p>Diagnosis: {appointment.diagnosis}</p>
            <p>Treatment: {appointment.treatment}</p>
          </>
        )}
      </div>
    </ConfigProvider>
  );
};

export default PastAppointmentPatient;
