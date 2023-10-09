import { DispatchWithoutAction, FC, useEffect, useState } from "react";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import { ConfigProvider, theme } from "antd";
import DoctorPatient from "../../assets/doctor_patient.json";
import Lottie from "react-lottie-player";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Loader from "../Loader/Loader";
import "./LandingPage.scss";

export const LandingPage: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [colorScheme, themeParams] = useThemeParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = window.Telegram.WebApp.initDataUnsafe.user.id;

  useEffect(() => {
    console.log("Setting up landing page");
    window.Telegram.WebApp.expand();
    // check user exists and logged in
    const checkUserExistsAndLoggedInPatient = async () => {
      const docRef = doc(db, "patients", userId.toString());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // check user.loggedIn
        const data = docSnap.data();
        if (data?.loggedIn) {
          // user is logged in
          navigate("/patient_dashboard");
        }
      } else {
        // user does not exist
        window.Telegram.WebApp.MainButton.setText("REGISTER AS A PATIENT");
      }
      setLoading(false);
    };
    const checkUserExistsAndLoggedInDoctor = async () => {
      const docRef = doc(db, "doctors", userId.toString());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // check user.loggedIn
        const data = docSnap.data();
        if (data?.loggedIn) {
          // user is logged in
          navigate("/doctor_dashboard");
        }
      } else {
        // user does not exist
        window.Telegram.WebApp.MainButton.setText("REGISTER AS A DOCTOR");
      }
      setLoading(false);
    };
    checkUserExistsAndLoggedInPatient();
    checkUserExistsAndLoggedInDoctor();
  }, [navigate, userId]);

  const checkUserExists = async (collectionName: string) => {
    const userRef = doc(db, collectionName, userId.toString());
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  };

  const handleDoctorRegister = async () => {
    window.Telegram.WebApp.MainButton.setText("CHECKING ACCOUNT...");
    window.Telegram.WebApp.MainButton.show();
    window.Telegram.WebApp.MainButton.showProgress();
    const exists = await checkUserExists("doctors");
    if (exists) {
      window.Telegram.WebApp.MainButton.setText(
        "ACCOUNT EXISTS, Logging in..."
      );
      const userRef = doc(db, "doctors", userId.toString());
      await updateDoc(userRef, {
        loggedIn: true,
      });
      navigate("/doctor_dashboard");
    } else {
      // Navigate to doctor registration page
      navigate("/register_doctor");
    }
    window.Telegram.WebApp.MainButton.hideProgress();
    window.Telegram.WebApp.MainButton.hide();
  };

  const handlePatientRegister = async () => {
    window.Telegram.WebApp.MainButton.setText("CHECKING ACCOUNT...");
    window.Telegram.WebApp.MainButton.show();
    window.Telegram.WebApp.MainButton.showProgress();
    const exists = await checkUserExists("patients");
    if (exists) {
      window.Telegram.WebApp.MainButton.setText(
        "ACCOUNT EXISTS, Logging in..."
      );
      const userRef = doc(db, "patients", userId.toString());
      await updateDoc(userRef, {
        loggedIn: true,
      });
      navigate("/patient_dashboard");
    } else {
      // Navigate to patient registration page
      navigate("/register_patient");
    }
    window.Telegram.WebApp.MainButton.hideProgress();
    window.Telegram.WebApp.MainButton.hide();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="landing_page">
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
        <div className="d-flex flex-column justify-content-center align-items-center text-center">
          <header className="App-header">
            <Lottie
              animationData={DoctorPatient}
              play
              loop={false}
              style={{ width: 200, height: 200 }}
            />
            <h1
              style={{
                fontSize: 30,
                fontWeight: "bold",
              }}
            >
              Welcome to Mediverse
            </h1>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                lineHeight: "1.5rem",
              }}
            >
              Bridging the Universe Between Patients and Doctors.
            </h2>
          </header>
          <div className="contentWrapper d-flex justify-content-center align-items-center flex-column gap-10">
            <div
              className="circularBigButton -salmon"
              onClick={handlePatientRegister}
            >
              Continue as a Patient
            </div>
            <div
              className="circularBigButton -blue"
              onClick={handleDoctorRegister}
            >
              Continue as a Doctor
            </div>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};

export default LandingPage;
