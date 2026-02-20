import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";

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