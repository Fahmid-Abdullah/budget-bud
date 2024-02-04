import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Col, Container, Form, Row, Button } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [_, setCookies] = useCookies(["access_token"]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const notify = (message) => toast(message);

    const onSubmit = async (event) => {
        event.preventDefault();
        const notify = (message) => toast(message);
        try {
            // Split the name into first name and last name
            const [firstName, ...lastNameArray] = name.split(" ");
            const lastName = lastNameArray.join(" ");

            const response = await axios.post("http://localhost:3001/auth/register", {
                firstName,
                lastName,
                email,
                password,
            });

            setCookies("access_token", response.data.token);
            navigate("/login");
            notify("Registration Successful.");
            window.localStorage.setItem("userID", response.data.userID);
        } catch (err) {
            if (err.response) {
                console.error(err.response.data);
            } else {
                console.error(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <ToastContainer />
            <Row>
                <Col md={6} className="register__bg"></Col>
                <Col md={7} className="register-container d-flex align-items-center justify-content-center flex-direction-column">
                    <Form style={{ width: "60%", maxWidth: 500 }} onSubmit={onSubmit}>
                        <h1 className="text-center">Sign Up</h1>
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Your name" onChange={(e) => setName(e.target.value)} value={name} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} value={email} />
                            <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? "Loading..." : "Submit"}
                        </Button>
                        <div className="py-4">
                            <p className="text-center">
                                Already have an account ? <Link to="/login">Login</Link>
                            </p>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};
