import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastWrapper = () => {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

export default ToastWrapper;
