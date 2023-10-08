import { DispatchWithoutAction, FC, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase"; // Adjust the path as per your project structure
import "./PatientDashboard.scss";
import { Button, ConfigProvider, theme } from "antd";
import Search from "antd/es/input/Search";
import { useNavigate } from "react-router-dom";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";

export const PatientDashboard: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [colorScheme, themeParams] = useThemeParams();
  const navigate = useNavigate();
  const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const userRef = doc(db, "patients", userId.toString());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserName(userSnap.data().name);
      }
    };

    fetchUserName();
  }, [userId]);

  const handleLogout = async () => {
    const userRef = doc(db, "patients", userId.toString());
    await updateDoc(userRef, {
      loggedIn: false,
    });
    navigate("/");
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsCollection = collection(db, "doctors");
      const doctorsSnapshot = await getDocs(doctorsCollection);
      const doctorsList = doctorsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setDoctors(doctorsList);
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const handleBackButtonClick = () => {
      navigate(-1);
    };
    window.Telegram.WebApp.onEvent("backButtonClicked", handleBackButtonClick);
    window.Telegram.WebApp.BackButton.show();
    return () => {
      window.Telegram.WebApp.offEvent(
        "backButtonClicked",
        handleBackButtonClick
      );
      window.Telegram.WebApp.BackButton.hide();
    };
  }, [navigate]);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      (doctor.name &&
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.speciality &&
        doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.location &&
        doctor.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <div className="patient_dashboard">
        <div className="header">
          <h2 className="welcome-message">{userName}'s Dashboard</h2>
          <Button className="logout-button" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <Search
          placeholder="Search by name, speciality, or location"
          allowClear
          enterButton="Search"
          // remove the search button
          size="large"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="profile">
            <img
              src={
                doctor.profileImage ||
                "https://images.pexels.com/photos/7242908/pexels-photo-7242908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150"
              }
              className="profile-img"
              alt={`Dr. ${doctor.name}`}
            />
            <div>
              <h3 className="profile-name">Dr.&nbsp; {doctor.name}</h3>
              <p className="profile-role">{doctor.speciality}</p>
              <p className="profile-role">
                Experience: {doctor.experience} years (Overall){" "}
              </p>
              <p className="profile-role">{doctor.location}</p>
              <p className="profile-role">
                Consultation Fee: ${doctor.consultationFee}
              </p>
            </div>
            <div className="text-center">
              <Button>Book Now</Button>
              <p>No booking fee</p>
            </div>
          </div>
        ))}
      </div>
    </ConfigProvider>
  );
};

export default PatientDashboard;
