import React from 'react';
import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { LinkContainer } from 'react-router-bootstrap';
import ReactPlayer from 'react-player';
import './LandingPage.css';
import landingAnimation from "../media/landingAnimation.mp4";

import '../media/font/29939506207.ttf'; // Aptos

export const LandingPage = () => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const toRotate = ["udget Bud"];
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(300 - Math.random() * 100);
  const period = 3000;

  useEffect(() => {
      let ticker = setInterval(() => {
          tick();
      }, delta)

      return () => {clearInterval(ticker)}
  }, [text])

  const tick = () => {
      let i = loopNum % toRotate.length;
      let fullText = toRotate[i];
      let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);

      setText(updatedText);

      if (isDeleting) {
          setDelta(prevDelta => prevDelta/4)
      }

      if (!isDeleting && updatedText === fullText) {
          setIsDeleting(true);
          setDelta(period);
      } else if (isDeleting && updatedText === fullText) {
          setIsDeleting(true);
          setDelta(period);
      } else if (isDeleting && updatedText === '') {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
          setDelta(500);
      }
  }

  return (
    <section className='banner'>
      <Container>
        <Row className='align-items-left'>
          <Col xs={12} md={6} xl={7} style={{ width: '100%', padding: 0, margin: 0, display: 'flex', justifyContent: 'flex-start' }}>
            <div className="video-player">
            <ReactPlayer 
              url={landingAnimation}
              width="103vw"
              height="110%"
              playing={true}
              loop={true}
              muted={true}
              controls={false}
              playbackRate={0.8}
            /></div>
            <h1 className="title" style={{ fontFamily: 'Aptos, sans-serif' }}>{`B`}<span className="wrap">{text}</span></h1>
            <p className="subtitle" style={{ fontFamily: 'Aptos, sans-serif' }}>Navigating Financial Success One Smart Decision at a Time</p>
            <LinkContainer to="/login">
              <button className='button-74' style={{ fontFamily: 'Aptos, sans-serif' }}>Start Saving Today</button>
            </LinkContainer>
            <a href="https://www.vecteezy.com/video/9543264-mountains-peak-landscape" className="video-attribution">
              Mountains peak Landscape Stock Videos by Vecteezy
            </a>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
