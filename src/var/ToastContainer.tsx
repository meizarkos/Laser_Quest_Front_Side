import { ToastContainer } from 'react-toastify';

function generateToastContainer() {
  return (
    <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} pauseOnHover={false} pauseOnFocusLoss={false} closeOnClick />
  );
}

export default generateToastContainer;