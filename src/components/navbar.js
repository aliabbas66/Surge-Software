import React, { useState }  from 'react';
import {Button, Container, Row, Col, Image, Dropdown, Nav, Tabs, Tab} from 'react-bootstrap';
import { BsFillBellFill } from "react-icons/bs";
import { AiOutlineSetting } from "react-icons/ai";
import logo from '../logo.svg';
import '../css/dashboardCompo.css';
import profile from '../img/profile.png';

const DashNavbar = props => {
    return (
        <header className="App-header">

                <Container fluid>
                    <Row className="navbarss">
                        <Col xs lg={3} className="bgg">
                            <div className="myLogo">
                            <Image src={logo} thumbnail={true}  className="logos" />
                            </div>
                        </Col>
                        <Col xs lg={9} className="align-items-center justify-content-end padd-right d-flex">
                            <Dropdown className="language">
                                <Dropdown.Toggle variant="light" id="dropdown-basic">
                                    English
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <div className="bell">
                                <BsFillBellFill className="white bells" />
                                <h6 className="notification">10</h6>
                            </div>

                            <AiOutlineSetting className="white setting" />
                            <div className="user-profile">
                                <div className="profile">
                                    <Image src={profile} thumbnail={true}  className="logos" />
                                </div>

                                <div>
                                    <span className="user-name">Shawn Brooks</span>
                                    <Dropdown className="active">
                                        <Dropdown.Toggle variant="lights" id="dropdown-basic">
                                            Active
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                            </div>
                        </Col>
                    </Row>


                </Container>

            </header>
    );
};


export default DashNavbar;
