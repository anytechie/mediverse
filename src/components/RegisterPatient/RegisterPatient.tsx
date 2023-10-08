import {
  ChangeEvent,
  DispatchWithoutAction,
  FC,
  useEffect,
  useState,
} from "react";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import { ConfigProvider, theme } from "antd";
import Patient from "../../assets/patient_signup.json";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import "./RegisterPatient.scss";
import Lottie from "react-lottie-player";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import StyledTextField from "../StyledTextField/StyledTextField";

export const RegisterPatient: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [colorScheme, themeParams] = useThemeParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    loggedIn: true,
  });

  const navigate = useNavigate();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {

    const handleBackButtonClick = () => {
      navigate(-1);
    };
    const onSubmit = async () => {
      if (!formData.name || !formData.email || !formData.age) {
        window.Telegram.WebApp.showPopup({
          title: "Error",
          message: "Please fill all the fields",
          buttons: [{ type: "ok" }],
        });
        return;
      }

      try {
        const userId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
        const patientRef = doc(db, "patients", userId); 
        await setDoc(patientRef, formData);

        window.Telegram.WebApp.showPopup({
          title: "Success",
          message: "Patient registered successfully!",
          buttons: [
            {
              type: "ok",
            },
          ],
        });
        navigate("/patient_dashboard");
      } catch (error) {
        console.error("Error adding document: ", error);
        window.Telegram.WebApp.showPopup({
          title: "Error",
          message: "Failed to register. Please try again.",
          buttons: [{ type: "ok" }],
        });
      }
    };

    window.Telegram.WebApp.onEvent("backButtonClicked", handleBackButtonClick);
    window.Telegram.WebApp.MainButton.setText("REGISTER");
    window.Telegram.WebApp.MainButton.onClick(onSubmit);
    return () => {
      window.Telegram.WebApp.offEvent("backButtonClicked", handleBackButtonClick);
      window.Telegram.WebApp.MainButton.offClick(onSubmit);
    };
  }, [formData, navigate]);

  useEffect(() => {
    window.Telegram.WebApp.MainButton.show();
    window.Telegram.WebApp.BackButton.show();
    return () => {
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.MainButton.hide();
    };
  }, []);

  return (
    <div>
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
        <div className="d-flex flex-column justify-content-center align-items-center">
          <header className="App-header">
            <Lottie
              animationData={Patient}
              play
              loop={false}
              style={{ width: 150, height: 150 }}
            />
            <h1
              style={{
                fontSize: 30,
                fontWeight: "bold",
              }}
            >
              Register as a Patient
            </h1>
          </header>
          <div className="contentWrapper">
            <Box component="form" sx={{ width: "80vw" }}>
              <StyledTextField
                type="text"
                label="Name"
                name="name"
                onChange={handleInputChange}
              />
              <StyledTextField
                type="email"
                label="Email"
                name="email"
                onChange={handleInputChange}
              />
              <StyledTextField
                type="number"
                label="Age"
                name="age"
                onChange={handleInputChange}
              />
            </Box>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};
