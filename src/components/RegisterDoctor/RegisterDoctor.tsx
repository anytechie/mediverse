import {
  ChangeEvent,
  DispatchWithoutAction,
  FC,
  useEffect,
  useState,
} from "react";
import {
  useThemeParams,
} from "@vkruglikov/react-telegram-web-app";
import { ConfigProvider, theme } from "antd";
import Doctor from "../../assets/doctor.json";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import "./RegisterDoctor.scss";
import Lottie from "react-lottie-player";
import { doc, getDoc, setDoc } from "firebase/firestore";
import WeekdayPicker from "../WeekdayPicker/WeekdayPicker";
import { db } from "../../firebase";

export const RegisterDoctor: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [colorScheme, themeParams] = useThemeParams();
  const [formData, setFormData] = useState({
    name: "",
    speciality: "",
    experience: "",
    startTime: "",
    endTime: "",
    email: "", // Add this line
  });

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
    const handleBackButtonClick = () => {
      navigate(-1);
    };
    const onSubmit = async () => {
      // Validate form data
      if (!formData.name || !formData.email || !formData.speciality || !formData.experience || !formData.startTime || !formData.endTime) {
        Telegram.WebApp.showPopup({
          title: "Error",
          message: "Please fill all the fields",
          buttons: [{ type: "ok", text: "OK" }]
        });
        return;
      }
    
      const doctorRef = doc(db, "doctors", formData.email); // Using the email as the document ID.
    
      // Check if doctor is already registered
      const docSnap = await getDoc(doctorRef);
      if (docSnap.exists()) {
        Telegram.WebApp.showPopup({
          title: "Error",
          message: "Doctor with this email is already registered.",
          buttons: [{ type: "ok", text: "OK" }]
        });
        return;
      }
    
      // If validation is successful and doctor is not already registered, proceed to submit data to Firestore
      try {
        await setDoc(doctorRef, {
          name: formData.name,
          email: formData.email,
          speciality: formData.speciality,
          experience: formData.experience,
          days: selectedWeekdays,
          startTime: formData.startTime,
          endTime: formData.endTime,
        });
    
        // If submission is successful, show a success message and then navigate to the next page
        Telegram.WebApp.showPopup({
          title: "Success",
          message: "Doctor registered successfully!",
          buttons: [
            {
              type: "ok",
              text: "OK",
              onClick: () => navigate("/next-page") // Replace "/next-page" with the actual path of the next page
            }
          ]
        });
      } catch (error) {
        console.error("Error adding document: ", error);
        Telegram.WebApp.showPopup({
          title: "Error",
          message: "Failed to register. Please try again.",
          buttons: [{ type: "ok", text: "OK" }]
        });
      }
    };
    Telegram.WebApp.onEvent("backButtonClicked", handleBackButtonClick);
    Telegram.WebApp.MainButton.show();
    Telegram.WebApp.MainButton.setText("REGISTER");
    Telegram.WebApp.MainButton.onClick(onSubmit);
    return () => {
      Telegram.WebApp.MainButton.hide();
      Telegram.WebApp.offEvent("backButtonClicked", handleBackButtonClick);
      Telegram.WebApp.MainButton.offClick(onSubmit);
    };
  }, [navigate, formData, selectedWeekdays]);


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
              animationData={Doctor}
              play
              //   loop={false}
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
                type="text"
                placeholder="Speciality"
                name="speciality"
                onChange={handleInputChange}
              />
              <input
                className="form-control"
                type="number"
                placeholder="Experience (Years)"
                name="experience"
                onChange={handleInputChange}
              />
              <h4>Working Days</h4>
              <WeekdayPicker onChange={handleDaysChange} />
              <h4>Start Time</h4>
              <input
                className="form-control"
                type="time"
                placeholder="Start Time"
                name="startTime"
                onChange={handleInputChange}
              />
              <h4>End Time</h4>
              <input
                className="form-control"
                type="time"
                placeholder="End Time"
                name="endTime"
                onChange={handleInputChange}
              />
            </Box>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};
