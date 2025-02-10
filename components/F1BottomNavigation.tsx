import { useState } from "react"
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material"
import React from "react"
import Image from "next/image"

export default function F1BottomNavigation() {
  const [navValue, setNavValue] = useState(0)

  return (
    <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "red" }} elevation={3}>
      <BottomNavigation 
        value={navValue} 
        onChange={(_, newValue: number) => setNavValue(newValue)} 
        showLabels
        sx={{ backgroundColor: "red" }}
      >
        {[
          { label: "HOME", icon: "/bottomnavImages/home.png" },
          { label: "DRIVER", icon: "/bottomnavImages/driver.png" },
          { label: "CIRCUIT", icon: "/bottomnavImages/circuit.png" },
          { label: "CALENDAR", icon: "/bottomnavImages/calendar.png" },
          { label: "MENU", icon: "/bottomnavImages/menu.png" },
        ].map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={
              <Image 
                src={item.icon} 
                alt={item.label}
                width={24}
                height={24}
              />
            }
            disableRipple
            sx={{
              "& .MuiBottomNavigationAction-label": { color: "white" },
              "&.Mui-selected": { "& .MuiBottomNavigationAction-label": { color: "white" } },
              "&:focus": { outline: "none" },
              "&.Mui-focusVisible": { outline: "none" }
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>

  )
}
