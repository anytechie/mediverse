import {
  ChangeEvent,
  DispatchWithoutAction,
  FC,
  useEffect,
  useState,
} from "react";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import { ConfigProvider, theme } from "antd";
import Doctor from "../../assets/doctor.json";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import "./RegisterDoctor.scss";
import Lottie from "react-lottie-player";
import { doc, getDoc, setDoc } from "firebase/firestore";
import WeekdayPicker from "../WeekdayPicker/WeekdayPicker";
import { db } from "../../firebase";
import StyledTextField from "../StyledTextField/StyledTextField";

export const RegisterDoctor: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [colorScheme, themeParams] = useThemeParams();
  const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
  const [formData, setFormData] = useState({
    name: "",
    speciality: "",
    experience: "",
    location: "",
    consultationFee: "20",
    startTime: "10:00",
    endTime: "18:00",
    email: "",
    loggedIn: true,
  });

  const [currentStep, setCurrentStep] = useState(1);

  const [selectedWeekdays, setSelectedWeekdays] = useState([0, 1, 2, 3, 4]);

  const navigate = useNavigate();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDaysChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setSelectedWeekdays(selectedValues);
  };

  useEffect(() => {
    const handleBack = () => {
      if (currentStep > 1) {
        setCurrentStep((prevStep) => prevStep - 1);
      } else {
        navigate(-1);
      }
    };
    const onSubmit = async () => {
      if (currentStep < 3) {
        console.log(formData);

        // ask user to fill all the fields
        if (
          currentStep === 1 &&
          (formData.name === "" ||
            formData.email === "" ||
            formData.speciality === "")
        ) {
          window.Telegram.WebApp.showPopup({
            title: "Error",
            message: "Please fill all the fields",
            buttons: [{ type: "ok" }],
          });
          return;
        }

        if (
          currentStep === 2 &&
          (formData.experience === "" ||
            formData.location === "" ||
            formData.consultationFee === "")
        ) {
          window.Telegram.WebApp.showPopup({
            title: "Error",
            message: "Please fill all the fields",
            buttons: [{ type: "ok" }],
          });
          return;
        }

        if (
          currentStep === 3 &&
          (formData.startTime === "" || formData.endTime === "")
        ) {
          window.Telegram.WebApp.showPopup({
            title: "Error",
            message: "Please fill all the fields",
            buttons: [{ type: "ok" }],
          });
          return;
        }

        setCurrentStep((prevStep) => prevStep + 1);
        return;
      }

      // Validate form data
      if (
        !formData.name ||
        !formData.email ||
        !formData.speciality ||
        !formData.experience ||
        !formData.startTime ||
        !formData.endTime ||
        !formData.location ||
        !formData.consultationFee
      ) {
        window.Telegram.WebApp.showPopup({
          title: "Error",
          message: "Please fill all the fields",
          buttons: [{ type: "ok" }],
        });
        return;
      }

      const doctorRef = doc(db, "doctors", userId.toString());

      // Check if doctor is already registered
      const docSnap = await getDoc(doctorRef);
      if (docSnap.exists()) {
        window.Telegram.WebApp.showPopup({
          title: "Error",
          message: "Doctor with this email is already registered.",
          buttons: [{ type: "ok" }],
        });
        return;
      }

      // If validation is successful and doctor is not already registered, proceed to submit data to Firestore
      try {
        await setDoc(doctorRef, {
          name: formData.name,
          id: userId.toString(),
          email: formData.email,
          speciality: formData.speciality,
          experience: formData.experience,
          location: formData.location,
          days: selectedWeekdays,
          startTime: formData.startTime,
          consultationFee: formData.consultationFee,
          endTime: formData.endTime,
          appointments: [],
        });

        // If submission is successful, show a success message and then navigate to the next page
        window.Telegram.WebApp.showPopup({
          title: "Success",
          message: "Doctor registered successfully!",
          buttons: [
            {
              type: "ok",
            },
          ],
        });
        navigate("/doctor_dashboard");
      } catch (error) {
        console.error("Error adding document: ", error);
        window.Telegram.WebApp.showPopup({
          title: "Error",
          message: "Failed to register. Please try again.",
          buttons: [{ type: "ok" }],
        });
      }
    };

    if (currentStep === 3) {
      window.Telegram.WebApp.MainButton.setText("REGISTER");
    } else {
      window.Telegram.WebApp.MainButton.setText("NEXT");
    }

    window.Telegram.WebApp.MainButton.onClick(onSubmit);
    window.Telegram.WebApp.onEvent("backButtonClicked", handleBack);

    return () => {
      window.Telegram.WebApp.offEvent("backButtonClicked", handleBack);
      window.Telegram.WebApp.MainButton.offClick(onSubmit);
    };
  }, [navigate, selectedWeekdays, currentStep, formData, userId]);

  useEffect(() => {
    window.Telegram.WebApp.MainButton.show();
    window.Telegram.WebApp.BackButton.show();
    return () => {
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.MainButton.hide();
    };
  }, []);

  return (
    <div className="register_doctor">
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
              animationData={Doctor}
              play
              style={{ width: 200, height: 200 }}
            />
            <h1
              style={{
                fontSize: 30,
                fontWeight: "bold",
              }}
            >
              Register as a Doctor
            </h1>
          </header>
          <div className="contentWrapper">
            <Box component="form" sx={{ mt: 2 }}>
              <div className={`step ${currentStep === 1 ? "active" : ""}`}>
                <StyledTextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <StyledTextField
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <StyledTextField
                  label="Speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleInputChange}
                />
              </div>
              <div className={`step ${currentStep === 2 ? "active" : ""}`}>
                <StyledTextField
                  label="Experience (Years)"
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
                <StyledTextField
                  label="Location (Area, City)"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
                <StyledTextField
                  label="Consultation Fee ($)"
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                />
              </div>
              <div className={`step ${currentStep === 3 ? "active" : ""}`}>
                <h4>Working Days</h4>
                <WeekdayPicker onChange={handleDaysChange} />
                <h4>Start Time</h4>
                <StyledTextField
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
                <h4>End Time</h4>
                <StyledTextField
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </Box>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};
