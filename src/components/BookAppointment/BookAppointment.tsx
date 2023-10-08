import { DispatchWithoutAction, FC, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust the path as per your project structure
import { useNavigate, useParams } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import { Box, TextField } from "@mui/material";

export const BookAppointment: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const navigate = useNavigate();
  const [colorScheme, themeParams] = useThemeParams();

  useEffect(() => {
    const fetchDoctor = async () => {
      const doctorRef = doc(db, "doctors", doctorId);
      const docSnap = await getDoc(doctorRef);
      if (docSnap.exists()) {
        setDoctor(docSnap.data());
      }
    };

    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const handleBackButtonClick = () => {
      navigate(-1);
    };
    
    window.Telegram.WebApp.onEvent("backButtonClicked", handleBackButtonClick);
    window.Telegram.WebApp.MainButton.show();
    window.Telegram.WebApp.BackButton.show();
    return () => {
      window.Telegram.WebApp.offEvent("backButtonClicked", handleBackButtonClick);
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.MainButton.hide();
    };
  }, [navigate]);

  

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
      {doctor && (
        <div>
          <div className="profile">
            <img
              src={doctor.profileImage}
              alt={`Dr. ${doctor.name}`}
              className="profile-img"
            />
            <h3>{doctor.name}</h3>
            <p>{doctor.speciality}</p>
            <p>{doctor.experience} years of experience</p>
          </div>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Time"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Problem Description"
              multiline
              rows={4}
              variant="outlined"
            />
          </Box>
        </div>
      )}
    </ConfigProvider>
  );
};

export default BookAppointment;
