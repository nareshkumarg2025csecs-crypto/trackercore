import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import "./PillNav.css";

const PillNav = ({
  items,
  baseColor = "#00FF87",
  pillColor = "#09110E",
  pillTextColor = "#00FF87",
  hoveredPillTextColor = "#09110E",
  initialLoadAnimation = true,
}) => {
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    if (initialLoadAnimation) {
      gsap.fromTo(
        navRef.current.querySelectorAll(".nav-pill-item"),
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [initialLoadAnimation]);

  const handleMouseEnter = (e) => {
    const bubble = e.currentTarget.querySelector(".nav-pill-bubble");
    gsap.to(bubble, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = (e) => {
    const bubble = e.currentTarget.querySelector(".nav-pill-bubble");
    gsap.to(bubble, {
      scale: 0,
      duration: 0.25,
      ease: "power2.inOut",
      overwrite: "auto",
    });
  };

  return (
    <nav className="pill-nav-container" ref={navRef}>
      <div className="pill-nav-inner">
        <div className="pill-nav-items">
          {items.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`nav-pill-item ${isActive ? "active" : ""}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  "--pill-color": pillColor,
                  "--pill-text-color": pillTextColor,
                  "--hovered-text-color": hoveredPillTextColor,
                  "--accent-color": baseColor,
                }}
              >
                <span className="nav-pill-text">{item.label}</span>
                <div className="nav-pill-bubble" style={{ backgroundColor: baseColor }}></div>
                {isActive && <div className="nav-active-dot" style={{ backgroundColor: baseColor }}></div>}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default PillNav;
