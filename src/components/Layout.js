import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="container">
        <Sidebar />
        <main className="content">
          {children}
        </main>
      </div>
    </>
  );
}

export default Layout;