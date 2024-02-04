import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { getUserID, useGetUserID } from "../hooks/getUserID";
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../media/logo.png'
import './NavBar.css'

export const NavBar = () => {
  const [cookies, setCookies] = useCookies(["access_token"]);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const userID = getUserID();

  const logOut = () => {
    setCookies("access_token", "");
    window.localStorage.removeItem("userID");
    navigate("/login");
  }

  const home = () => {
    navigate("/dashboard");
  }

  const stats = () => {
    navigate("/stats");
  }

  return (
    <Navbar expand="lg" className="navbar-container bg-body-tertiary">
      <Container className="nav-box">
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={home}>Dashboard</Nav.Link>
            <Nav.Link onClick={stats}>Stats</Nav.Link>
            <Nav.Link onClick={logOut}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <img className="logo" src={logo} />
      </Container>
      
    </Navbar>
  );
}
