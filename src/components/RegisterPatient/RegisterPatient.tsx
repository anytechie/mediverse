import { ChangeEvent, DispatchWithoutAction, FC, useState } from "react";
import {
  BackButton,
  useShowPopup,
  useThemeParams,
} from "@vkruglikov/react-telegram-web-app";
import { ConfigProvider, theme } from "antd";
import Patient from "../../assets/patient_signup.json";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import "./RegisterPatient.scss";
import Lottie from "react-lottie-player";
import { MainButton } from "@vkruglikov/react-telegram-web-app";

export const RegisterPatient: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [colorScheme, themeParams] = useThemeParams();
  const showPopup = useShowPopup();
  const [formData, setFormData] = useState({
    name: "",
    email: "", // Add this line
    age: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // eslint-disable-next-line no-undef
  Telegram.WebApp.onEvent("backButtonClicked", () => {
    navigate(-1);
  });

  const onSubmit = async (values: any) => {
    console.log(values);
    const res = await showPopup({
      title: "Register Doctor",
      message: "Are you sure you want to register this doctor?",
      buttons: [
        {
          type: "ok",
          text: "Yes",
        },
        {
          type: "destructive",
          text: "No",
        },
      ],
    });
    console.log(res);
  };

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
            <Box component="form" sx={{width: "80vw"}}>
              <input
                className="form-control"
                type="text"
                placeholder="Name"
                name="name"
                onChange={handleInputChange}
              />
              <input
                className="form-control"
                type="email"
                placeholder="Email"
                name="email"
                onChange={handleInputChange}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Age"
                name="age"
                onChange={handleInputChange}
              />
            </Box>

            <BackButton
              onClick={() => {
                showPopup({
                  title: "Back button click",
                  message: "Back button click",
                });
              }}
            />
            <MainButton
              text="REGISTER"
              onClick={() => {
                onSubmit(formData);
              }}
            />
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};
