import { useState, useEffect, FC, DispatchWithoutAction } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Tabs, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import "./DoctorDashboard.scss";
import Doctor1 from "../../assets/doctor_1.jpg";
import Doctor2 from "../../assets/doctor_2.jpg";

const { TabPane } = Tabs;

export const DoctorDashboard: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [pastAppointments, setPastAppointments] = useState([]);
  const navigate = useNavigate();
  const doctorId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  const [colorScheme, themeParams] = useThemeParams();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", doctorId)
        );
        const querySnapshot = await getDocs(q);
        const allAppointments = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setUpcomingAppointments(
          allAppointments.filter((app: any) => !app.done)
        );
        setPastAppointments(allAppointments.filter((app: any) => app.done));
      } catch (error) {
        console.log(error);
        window.Telegram.WebApp.showAlert("Error fetching appointments");
      }
    };

    fetchAppointments();
  }, [doctorId]);

  useEffect(() => {
    const fetchDoctorName = async () => {
      try {
        const doctorRef = doc(db, "doctors", doctorId);
        const docSnap = await getDoc(doctorRef);
        if (docSnap.exists()) {
          setDoctorName(docSnap.data().name);
        }
      } catch (error) {
        console.log(error);
        window.Telegram.WebApp.showAlert("Error fetching doctor name");
      }
    };

    fetchDoctorName();
  }, [doctorId]);

  const handleLogout = async () => {
    try {
      const doctorRef = doc(db, "doctors", doctorId);
      await updateDoc(doctorRef, {
        loggedIn: false,
      });
      navigate("/");
    } catch (error) {
      console.log(error);
      window.Telegram.WebApp.showAlert("Error logging out");
    }
  };

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
      <div className="doctor_dashboard">
        <div className="header">
          <h1 className="welcome_message">Dr. {doctorName}'s Dashboard</h1>
          <Button className="logout-button" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <Tabs defaultActiveKey="1" centered>
          <TabPane tab="Upcoming Appointments" key="1">
            {upcomingAppointments.map((app) => (
              <div key={app.id} className="profile">
                <div className="text-center">
                  <img
                    src={Math.random() > 0.5 ? Doctor1 : Doctor2}
                    className="profile-img"
                    alt={`Patient ${app.patientName}`}
                  />
                  <h3 className="profile-name">{app.patientName}</h3>
                </div>
                <div className="text-center">
                  <p className="profile-role">Date: {app.date}</p>
                  <p className="profile-role">Time: {app.slot}</p>
                  <Button
                    onClick={() => navigate(`/resolve_appointment/${app.id}`)}
                  >
                    Consult
                  </Button>
                </div>
              </div>
            ))}
          </TabPane>
          <TabPane tab="Past Appointments" key="2">
            {pastAppointments.map((app) => (
              <div key={app.id} className="profile">
                <div className="text-center">
                  <img
                    src={Math.random() > 0.5 ? Doctor1 : Doctor2}
                    className="profile-img"
                    alt={`Patient ${app.patientName}`}
                  />
                  <h3 className="profile-name">{app.patientName}</h3>
                </div>
                <div className="text-center">
                  <p className="profile-role">Date: {app.date}</p>
                  <p className="profile-role">Time: {app.slot}</p>
                  <Button
                    onClick={() =>
                      navigate(`/past_appointment_doctor/${app.id}`)
                    }
                  >
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

export default DoctorDashboard;
