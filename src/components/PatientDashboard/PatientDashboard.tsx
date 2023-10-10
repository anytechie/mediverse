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
import { Rate } from "antd";
import { db } from "../../firebase";
import { Button, ConfigProvider, Tabs, theme } from "antd";
import Search from "antd/es/input/Search";
import { useNavigate } from "react-router-dom";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import Doctor1 from "../../assets/doctor_1.jpg";
import Doctor2 from "../../assets/doctor_2.png";
import Doctor3 from "../../assets/doctor_3.png";
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
  const [ratings, setRatings] = useState({});
  const [activeTab, setActiveTab] = useState("2");

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, "patients", userId.toString());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserName(userSnap.data().name);
        setRatings(userSnap.data().ratings || {});
      }
    };

    fetchUserData();
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
      console.log(allAppointments);
      setUpcomingAppointments(allAppointments.filter((app: any) => !app.done));
      setPastAppointments(allAppointments.filter((app: any) => app.done));
    };

    fetchAppointments();
  }, [userId]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        window.Telegram.WebApp.MainButton.show();
        window.Telegram.WebApp.MainButton.setText("LOADING...");
        window.Telegram.WebApp.MainButton.showProgress();
        const doctorsCollection = collection(db, "doctors");
        const doctorsSnapshot = await getDocs(doctorsCollection);
        const doctorsList = doctorsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setDoctors(doctorsList);
        window.Telegram.WebApp.MainButton.hideProgress();
        window.Telegram.WebApp.MainButton.hide();
      } catch (e) {
        console.log(e);
        window.Telegram.WebApp.showAlert("Error fetching doctors");
      }
    };

    fetchDoctors();
  }, [activeTab]);

  const handleRateChange = async (doctorId, value) => {
    setRatings((prev) => ({ ...prev, [doctorId]: value }));

    // Update the doctor's ratings in the database
    const doctorRef = doc(db, "doctors", doctorId);
    const doctorSnap = await getDoc(doctorRef);
    if (doctorSnap.exists()) {
      const doctorData = doctorSnap.data();
      const updatedRatings = doctorData.ratings
        ? [...doctorData.ratings, value]
        : [value];
      await updateDoc(doctorRef, { ratings: updatedRatings });
    }

    // Update the user's ratedDoctors in the database
    const userRef = doc(db, "patients", userId.toString());
    await updateDoc(userRef, { ratings: { ...ratings, [doctorId]: value } });
  };

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

        <Tabs
          defaultActiveKey="2"
          centered
          activeKey={activeTab}
          onChange={setActiveTab}
        >
          <TabPane tab="Upcoming" key="1">
            {upcomingAppointments.map((app, idx) => (
              <div key={app.id} className="profile">
                <div className="text-center">
                  <img
                    src={
                      idx % 3 === 0
                        ? Doctor1
                        : idx % 3 === 1
                        ? Doctor2
                        : Doctor3
                    }
                    className="profile-img"
                    alt={`Doctor ${app.doctorName}`}
                  />
                  <h3 className="profile-name">Dr. {app.doctorName}</h3>
                </div>
                <div className="text-center">
                  <p className="profile-role">Date: {app.date}</p>
                  <p className="profile-role">Time: {app.slot}</p>
                  <Button
                    onClick={() => navigate(`/view_appointment/${app.id}`)}
                  >
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
            {filteredDoctors.map((doctor, idx) => (
              <div key={doctor.id} className="profile">
                <div className="text-center">
                  <img
                    src={
                      idx % 3 === 0
                        ? Doctor1
                        : idx % 3 === 1
                        ? Doctor2
                        : Doctor3
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
                  <Rate
                    value={
                      doctor.ratings
                        ? doctor.ratings.reduce((a, b) => a + b, 0) /
                          doctor.ratings.length
                        : 0
                    }
                    disabled
                  />
                  <p className="profile-role">{doctor.location}</p>
                  <p className="profile-role">
                    Consultation Fee: ${doctor.consultationFee}
                  </p>
                  <Button onClick={() => handleBook(doctor.id)}>
                    Book Now
                  </Button>
                  <p>No booking fee</p>
                </div>
              </div>
            ))}
          </TabPane>

          <TabPane tab="History" key="3">
            {pastAppointments.map((app, idx) => (
              <div key={app.id} className="profile">
                <div className="text-center">
                  <img
                    src={
                      idx % 3 === 0
                        ? Doctor1
                        : idx % 3 === 1
                        ? Doctor2
                        : Doctor3
                    }
                    className="profile-img"
                    alt={`Doctor ${app.doctorName}`}
                  />
                  <h3 className="profile-name">{app.doctorName}</h3>
                </div>
                <div className="text-center d-flex flex-column">
                  <Rate
                    value={ratings[app.doctorId] || 0}
                    onChange={(value) => handleRateChange(app.doctorId, value)}
                    disabled={ratings[app.doctorId] !== undefined}
                    style={{
                      marginBottom: "10px",
                    }}
                  />
                  <p className="profile-role">Date: {app.date}</p>
                  <p className="profile-role">Time: {app.slot}</p>

                  <Button
                    onClick={() => navigate(`/view_past_appointment/${app.id}`)}
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

export default PatientDashboard;
