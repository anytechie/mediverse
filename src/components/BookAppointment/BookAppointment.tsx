import { DispatchWithoutAction, FC, useEffect, useState } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import { Box, MenuItem } from "@mui/material";
import "./BookAppointment.scss";
import StyledTextField from "../StyledTextField/StyledTextField";
import Loader from "../Loader/Loader";

export const BookAppointment: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [patientName, setPatientName] = useState("");
  const navigate = useNavigate();
  const [colorScheme, themeParams] = useThemeParams();

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    const fetchPatientName = async () => {
      const patientId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
      const patientRef = doc(db, "patients", patientId);
      const docSnap = await getDoc(patientRef);
      if (docSnap.exists()) {
        setPatientName(docSnap.data().name);
      }
    };

    fetchPatientName();
  }, []);

  const currentDate = new Date();
  const minDate = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (formData.date && doctorId) {
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", doctorId),
          where("date", "==", formData.date)
        );
        const querySnapshot = await getDocs(q);
        const bookedTimes = querySnapshot.docs.map((doc) => doc.data().slot);
        setBookedSlots(bookedTimes);
        setLoading(false);
      }
    };

    fetchBookedSlots();
  }, [formData.date, doctorId]);

  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    const currentDate = new Date();
    const selectedDate = new Date(formData.date);
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);

    for (let i = startHour; i < endHour; i++) {
      for (let j = 0; j < 60; j += 30) {
        if (
          currentDate.toDateString() === selectedDate.toDateString() &&
          (i < currentHour || (i === currentHour && j <= currentMinute))
        ) {
          continue; // Skip past times for the current day
        }

        const hour = i < 10 ? `0${i}` : i;
        const minute = j < 10 ? `0${j}` : j;
        slots.push(`${hour}:${minute}`);
      }
    }
    return slots;
  };

  const timeSlots = doctor
    ? generateTimeSlots(doctor.startTime, doctor.endTime)
    : [];

  const availableSlots = timeSlots.filter(
    (slot) => !bookedSlots.includes(slot)
  );

  useEffect(() => {
    const handleBackButtonClick = () => {
      navigate(-1);
    };

    const handleBookAppointment = async () => {
      const patientId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
      await addDoc(collection(db, "appointments"), {
        doctorId,
        patientId,
        patientName,
        doctorName: doctor.name,
        date: formData.date,
        slot: formData.time,
        description: formData.description,
      });

      await addDoc(collection(db, "messages"), {
        userId: doctorId,
        content: `You have a new appointment from *${patientName}* on *${formData.date}* at *${formData.time}*`,
      });
      await addDoc(collection(db, "messages"), {
        userId: patientId,
        content: `Your appointment with *Dr. ${doctor.name}* on *${formData.date}* at *${formData.time}* has been booked successfully`,
      });

      window.Telegram.WebApp.showPopup({
        title: "Success",
        message: "Appointment booked successfully. You can see it in the upcoming appointments section.",
        buttons: [{ type: "ok" }],
      })
      navigate("/patient_dashboard");
    };

    window.Telegram.WebApp.MainButton.setText("BOOK APPOINTMENT");
    window.Telegram.WebApp.onEvent("backButtonClicked", handleBackButtonClick);
    window.Telegram.WebApp.MainButton.onClick(handleBookAppointment);
    return () => {
      window.Telegram.WebApp.offEvent(
        "backButtonClicked",
        handleBackButtonClick
      );
      window.Telegram.WebApp.MainButton.offClick(handleBookAppointment);
    };
  }, [navigate, formData, doctorId, patientName, doctor?.name]);

  useEffect(() => {
    window.Telegram.WebApp.MainButton.show();
    window.Telegram.WebApp.BackButton.show();
    return () => {
      window.Telegram.WebApp.BackButton.hide();
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
      {loading ? (
        <Loader />
      ) : (
        doctor && (
          <div className="book_appointment">
            <div className="profile">
              <img
                src={
                  doctor.profileImage ||
                  "https://images.pexels.com/photos/7242908/pexels-photo-7242908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150"
                }
                alt={`Dr. ${doctor.name}`}
                className="profile-img"
              />
              <h3>{doctor.name}</h3>
              <p>{doctor.speciality}</p>
              <p>{doctor.experience} years of experience</p>
            </div>
            <Box component="form" style={{ paddingInline: 20 }}>
              <StyledTextField
                label="Date"
                type="date"
                name="date"
                // minDate
                inputProps={{
                  min: minDate,
                }}
                value={formData.date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              {formData.date && (
                <StyledTextField
                  select
                  label="Select Slot"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                >
                  {availableSlots.map((slot, index) => (
                    <MenuItem key={index} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </StyledTextField>
              )}
              <StyledTextField
                label="Problem Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
            </Box>
          </div>
        )
      )}
    </ConfigProvider>
  );
};

export default BookAppointment;
