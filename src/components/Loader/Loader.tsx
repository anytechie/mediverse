import Lottie from "react-lottie-player";
import Loading from "../../assets/doctor.json";

function Loader() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
      }}
    >
      <Lottie
        animationData={Loading}
        play
        loop
        style={{ width: "80%", height: "80%" }}
      />
    </div>
  );
}

export default Loader;
