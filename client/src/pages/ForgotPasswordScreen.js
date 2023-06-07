import React, { useState } from 'react';
import axios from 'axios';
import { Row, Col, Form, Input, Button, message } from 'antd';
import { useDispatch } from 'react-redux';
// import { forgotpassword } from '../redux/actions/userActions';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init();

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const forgotPasswordHandler = async (e) => {
    const config = {
      Headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const { data } = await axios.post(
        '/api/users/forgotpassword',
        { email },
        config
      );
      message.success('Email Sent');
      setSuccess(data.data);
    } catch (error) {
      message.error('Invalid Mail');
      setError(error.response.data.error);
      setEmail('');
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  return (
    <div className="register">
      <Row justify="center" className="flex align-items-center">
        <Col lg={5}>
          <h1 className="heading1" data-aos="slide-right">
            InCamp
          </h1>
        </Col>
        <Col lg={10} sm={24} className="bs p-5 register-form">
          <h3>Forgot Password </h3>
          <hr />
          <Form layout="vertical" onFinish={forgotPasswordHandler}>
            <Form.Item
              type="email"
              label="Email"
              required
              id="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              rules={[
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                  required: 'true',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Button htmlType="submit" className="mb-3">
              Submit
            </Button>{' '}
            <br />
            <Link to="/login" className="mt-3">
              Already registered ? , Click here to login
            </Link>
          </Form>
        </Col>
        <Col lg={5}>
          <h1 className="heading2" data-aos="slide-left">
            Jobs
          </h1>
        </Col>
      </Row>
    </div>
  );
};

export default ForgotPassword;
