import { DispatchWithoutAction, FC } from "react";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import { ConfigProvider, theme, Button } from "antd";
import DoctorPatient from "../../assets/doctor.json";
import Lottie from "react-lottie-player";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust the path as per your project structure
import { parseInitData } from "../twa/utils";

export const LandingPage: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [colorScheme, themeParams] = useThemeParams();
  const navigate = useNavigate();

  const userData = parseInitData(window.Telegram.WebApp.initData);
  const userId = userData.user.id;
  console.log(userId, window.Telegram);

  const checkUserExists = async (collectionName: string) => {
    const userRef = doc(db, collectionName, userId.toString());
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  };

  const handleDoctorRegister = async () => {
    window.Telegram.WebApp.MainButton.show();
    window.Telegram.WebApp.MainButton.showProgress();
    const exists = await checkUserExists("doctors");
    if (exists) {
      navigate("/doctor_dashboard");
    } else {
      // Navigate to doctor registration page
      navigate("/register_doctor");
    }
    window.Telegram.WebApp.MainButton.hideProgress();
    window.Telegram.WebApp.MainButton.hide();

  };

  const handlePatientRegister = async () => {
    window.Telegram.WebApp.MainButton.show();

    window.Telegram.WebApp.MainButton.showProgress();
    const exists = await checkUserExists("patients");
    if (exists) {
      window.Telegram.WebApp.MainButton.setText("ACCOUNT EXISTS, Logging in...");
      navigate("/patient_dashboard");
    } else {
      // Navigate to patient registration page
      navigate("/register_patient");
    }
    window.Telegram.WebApp.MainButton.hideProgress();
    window.Telegram.WebApp.MainButton.hide();

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
        <div className="d-flex flex-column justify-content-center align-items-center text-center h-80">
          <header className="App-header">
            <Lottie
              animationData={DoctorPatient}
              play
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
              <Button type="primary" block onClick={handleDoctorRegister}>
                Register as a Doctor
              </Button>
              <Button type="primary" onClick={handlePatientRegister}>
                Register as a Patient
              </Button>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};

export default LandingPage;
