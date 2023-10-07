import { DispatchWithoutAction, FC } from "react";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import { ConfigProvider, theme, Button } from "antd";
import DoctorPatient from "../../assets/doctor.json";
import Lottie from "react-lottie-player";
import { Link } from "react-router-dom";

export const LandingPage: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [colorScheme, themeParams] = useThemeParams();

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
        <div className="d-flex flex-column justify-content-center align-items-center text-center h-80">
          <header className="App-header">
            <Lottie
              animationData={DoctorPatient}
              play
              // loop={false}
              style={{ width: 200, height: 200 }}
            />
            <h1
              style={{
                fontSize: 30,
                fontWeight: "bold",
              }}
            >
              Welcome to Medverse
            </h1>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              Bridging the Universe Between Patients and Doctors.
            </h2>
          </header>
          <div className="contentWrapper d-flex flex-column justify-content-center align-items-center">
            <Link to="/register_doctor" className="m-2">
              <Button type="primary" block>
                Register as a Doctor
              </Button>
            </Link>
            <Link to="/register_patient">
              <Button type="primary" block>
                Register as a Patient
              </Button>
            </Link>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};
