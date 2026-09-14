import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "./AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { checkAuth } from "./features/auth/redux/authSlice";
import { checkAdminAuth } from "./admin/features/auth/redux/adminAuthSlice";
import GlobalLoader from "./components/GlobalLoader";

const App = () => {
  const dispatch = useDispatch();
  const { sessionChecked } = useSelector((state) => state.auth);
  const { sessionChecked: adminSessionChecked } = useSelector(
    (state) => state.adminAuth,
  );

  useEffect(() => {
    dispatch(checkAuth());
    dispatch(checkAdminAuth());
  }, [dispatch]);

  if (!sessionChecked || !adminSessionChecked) return null;

  return (
    <>
      <ScrollToTop />
      <GlobalLoader />
      <AppRoutes />
      <ToastContainer
        position="bottom-center"
        autoClose={2500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default App;

