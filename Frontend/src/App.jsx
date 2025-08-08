// src/App.jsx
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageWrapper from "./components/PageWrapper";
import Connect from "./pages/Connect";
import Send from "./pages/Send";
import Schedule from "./pages/Schedule";
import Logo from "./assets/Slack_Technologies_Logo.svg";

export default function App() {
  const location = useLocation();
  const links = [
    { to: "/", label: "Connect", end: true },
    { to: "/send", label: "Send" },
    { to: "/schedule", label: "Schedule" },
  ];

  return (
    <div className="w-full px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <img src={Logo} alt="Slack Connect" className="h-8" />
        <nav>
          <ul className="flex space-x-8">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `
                    relative text-sm font-medium
                    transition-colors duration-200 ease-in-out
                    ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }
                    after:absolute after:-bottom-1 after:left-0
                    after:h-0.5 after:w-full
                    after:scale-x-0 after:bg-blue-600
                    after:transition-transform after:duration-200 after:ease-in-out
                    ${
                      isActive ? "after:scale-x-100" : "hover:after:scale-x-100"
                    }
                    `
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="min-h-[60vh]">
        <AnimatePresence exitBeforeEnter>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageWrapper>
                  <Connect />
                </PageWrapper>
              }
            />
            <Route
              path="/send"
              element={
                <PageWrapper>
                  <Send />
                </PageWrapper>
              }
            />
            <Route
              path="/schedule"
              element={
                <PageWrapper>
                  <Schedule />
                </PageWrapper>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
