import { DispatchWithoutAction, FC, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Button, ConfigProvider, Tabs, theme } from "antd";
import Search from "antd/es/input/Search";
import { useNavigate } from "react-router-dom";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import "./PatientDashboard.scss";

const { TabPane } = Tabs;

export const PatientDashboard: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [colorScheme, themeParams] = useThemeParams();
  const navigate = useNavigate();
  const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
  const [userName, setUserName] = useState("");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);

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

  useEffect(() => {
    const fetchAppointments = async () => {
      const q = query(
        collection(db, "appointments"),
        where("patientId", "==", userId.toString())
      );
      const querySnapshot = await getDocs(q);
      const allAppointments = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log(allAppointments)
      setUpcomingAppointments(allAppointments.filter((app: any) => !app.done));
      setPastAppointments(allAppointments.filter((app: any) => app.done));
    };

    fetchAppointments();
  }, [userId]);

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

  const handleLogout = async () => {
    const userRef = doc(db, "patients", userId.toString());
    await updateDoc(userRef, {
      loggedIn: false,
    });
    navigate("/");
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      (doctor.name &&
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.speciality &&
        doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.location &&
        doctor.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBook = (id: any) => {
    navigate(`/book_appointment/${id}`);
  };

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

        <Tabs defaultActiveKey="2" centered>
          <TabPane tab="Upcoming" key="1">
            {upcomingAppointments.map((app) => (
              <div key={app.id} className="profile">
                <div className="text-center">
                <img
                  src={
                    "https://images.pexels.com/photos/7242908/pexels-photo-7242908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150"
                  }
                  className="profile-img"
                  alt={`Doctor ${app.doctorName}`}
                />
                  <h3 className="profile-name">Dr. {app.doctorName}</h3>
                </div>
                <div className="text-center">
                  <p className="profile-role">Date: {app.date}</p>
                  <p className="profile-role">Time: {app.slot}</p>
                  <Button onClick={() => navigate(`/view_appointment/${app.id}`)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </TabPane>

          <TabPane tab="Explore" key="2">
            <Search
              placeholder="Search by name, speciality, or location"
              allowClear
              enterButton="Search"
              size="large"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="profile">
                <div className="text-center">
                <img
                  src={
                    doctor.profileImage ||
                    "https://images.pexels.com/photos/7242908/pexels-photo-7242908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150"
                  }
                  className="profile-img"
                  alt={`Dr. ${doctor.name}`}
                />
                  <h3 className="profile-name">Dr.&nbsp; {doctor.name}</h3>
                  <p className="profile-role">{doctor.speciality}</p>
                  <p className="profile-role">
                    Experience: {doctor.experience} years (Overall){" "}
                  </p>
                </div>
                <div className="text-center">
                  <p className="profile-role">{doctor.location}</p>
                  <p className="profile-role">
                    Consultation Fee: ${doctor.consultationFee}
                  </p>
                  <Button onClick={() => handleBook(doctor.id)}>Book Now</Button>
                  <p>No booking fee</p>
                </div>
              </div>
            ))}
          </TabPane>

          <TabPane tab="History" key="3">
            {pastAppointments.map((app) => (
              <div key={app.id} className="profile">
                <div>
                <img
                  src={
                    "https://images.pexels.com/photos/7242908/pexels-photo-7242908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150"
                  }
                  className="profile-img"
                  alt={`Doctor ${app.doctorName}`}
                />
                  <h3 className="profile-name">{app.doctorName}</h3>
                </div>
                <div className="text-center">
                  <p className="profile-role">Date: {app.date}</p>
                  <p className="profile-role">Time: {app.slot}</p>
                  <Button onClick={() => navigate(`/view_past_appointment/${app.id}`)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </TabPane>
        </Tabs>
      </div>
    </ConfigProvider>
  );
};

export default PatientDashboard;
