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
import Doctor1 from "../../assets/doctor_1.jpg";
import Doctor2 from "../../assets/doctor_2.jpg";
import StyledTextField from "../StyledTextField/StyledTextField";

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
      const patientId =
        window.Telegram.WebApp.initDataUnsafe.user.id.toString();
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
      try {
        window.Telegram.WebApp.MainButton.showProgress();
        if (formData.date && doctorId) {
          const q = query(
            collection(db, "appointments"),
            where("doctorId", "==", doctorId),
            where("date", "==", formData.date)
          );
          const querySnapshot = await getDocs(q);
          const bookedTimes = querySnapshot.docs.map((doc) => doc.data().slot);
          setBookedSlots(bookedTimes);
        }
        window.Telegram.WebApp.MainButton.hideProgress();
      } catch (error) {
        console.log(error);
        window.Telegram.WebApp.showAlert("Error fetching appointments");
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
      if (!formData.date || !formData.time || !formData.description) {
        window.Telegram.WebApp.showPopup({
          title: "Error",
          message: "Please fill all the fields",
          buttons: [{ type: "ok" }],
        });
        return;
      }

      try {
        window.Telegram.WebApp.MainButton.showProgress();
        const patientId =
          window.Telegram.WebApp.initDataUnsafe.user.id.toString();
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
          content: `
*New Appointment*
*Patient Name*: ${patientName}
*Date*: ${formData.date}
*Time*: ${formData.time}
*Description*: ${formData.description}
You can contact the patient by clicking [here](tg://user?id=${patientId}).
          `,
        });
        await addDoc(collection(db, "messages"), {
          userId: patientId,
          content: `
*Appointment Confirmed*
*Doctor Name*: ${doctor.name}
*Date*: ${formData.date}
*Time*: ${formData.time}
*Description*: ${formData.description}        
*Consultation Fee*: $${doctor.consultationFee}
Please contact the doctor at the scheduled time by clicking [here](tg://user?id=${doctorId}).
Your invoice will be sent in the next message.
          `,
          amount: doctor.consultationFee,
        });

        window.Telegram.WebApp.MainButton.hideProgress();
        window.Telegram.WebApp.showPopup({
          title: "Success",
          message:
            "Appointment booked successfully. You can see it in the upcoming appointments section.",
          buttons: [{ type: "ok" }],
        });
        navigate("/patient_dashboard");
      } catch (error) {
        console.log(error);
        window.Telegram.WebApp.showAlert("Error booking appointment");
        window.Telegram.WebApp.MainButton.hideProgress();
      }
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
  }, [
    navigate,
    formData,
    doctorId,
    patientName,
    doctor?.name,
    doctor?.consultationFee,
  ]);

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
      {doctor ? (
        <div className="book_appointment">
          <div className="profile">
            <img
              src={doctor.profileImage || (doctor.name.length % 2 ? Doctor1 : Doctor2)}
              alt={`Dr. ${doctor.name}`}
              className="profile-img"
            />
            <h3>Dr. {doctor.name}</h3>
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
            {formData.date &&
              (availableSlots.length > 0 ? (
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
              ) : (
                <h3
                  style={{
                    color: "#f44336",
                    padding: "5px",
                  }}
                >
                  No slots available for this day. <br />
                  <br />
                  Please select another date.
                </h3>
              ))}

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
      ) : null}
    </ConfigProvider>
  );
};

export default BookAppointment;
