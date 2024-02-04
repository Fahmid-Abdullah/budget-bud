import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [_, setCookies] = useCookies(["access_token"]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const notify = (message) => toast(message);
  
    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
          const response = await axios.post("http://localhost:3001/auth/login", {
            email,
            password,
          });
          setCookies("access_token", response.data.token);
          notify("Login Successful.");
          navigate("/dashboard");
          window.localStorage.setItem("userID", response.data.userID);
        } catch (err) {
          if (err.response) {
            notify(`Login failed: ${err.response.data.message}`);
            console.error(err.response.data);
          } else {
            notify(`Login failed: ${err.message}`);
            console.error(err.message);
          }
        } finally {
            setLoading(false);
        }
      };

    return (
        <Container>
            <Row>
                <ToastContainer />
                <Col md={6} className="login__bg"></Col>
                <Col md={7} className="login-container d-flex align-items-center justify-content-center flex-direction-column">
                    <Form style={{ width: "60%", maxWidth: 500 }} onSubmit={onSubmit}>
                    <h1 className="text-center">Log In</h1>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} value={email} required />
                            <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} required />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? "Loading..." : "Submit"}
                        </Button>
                        <div className="py-4">
                            <p className="text-center">
                                Don't have an account ? <Link to="/register">Signup</Link>
                            </p>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}