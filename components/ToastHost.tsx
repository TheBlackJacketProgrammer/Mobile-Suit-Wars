"use client";

import { ToastContainer } from "react-toastify";

/** Renders outside SessionProvider so toasts survive auth / layout updates. */
export default function ToastHost() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      style={{ zIndex: 99999 }}
    />
  );
}
