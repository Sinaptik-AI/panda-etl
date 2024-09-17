import React, { useState } from "react";

interface SwitchProps {
  onChange?: (isOn: boolean) => void;
  value: boolean;
}

const Switch: React.FC<SwitchProps> = ({ onChange, value }) => {
  const toggleSwitch = () => {
    const newState = !value;
    if (onChange) {
      onChange(newState);
    }
  };

  return (
    <div onClick={toggleSwitch} style={styles.container}>
      <div
        style={{ ...styles.switch }}
        className={value ? "bg-primary" : "bg-gray-400"}
      >
        <div
          style={{
            ...styles.circle,
            transform: value ? "translateX(20px)" : "translateX(0)",
          }}
        ></div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  switch: {
    width: "40px",
    height: "20px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    padding: "2px",
    marginRight: "10px",
  },
  circle: {
    width: "16px",
    height: "16px",
    backgroundColor: "white",
    borderRadius: "50%",
    transition: "transform 0.3s ease",
  },
};

export default Switch;
