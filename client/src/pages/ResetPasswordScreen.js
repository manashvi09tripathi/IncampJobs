import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, message } from 'antd';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

AOS.init();

const ResetPasswordScreen = ({ match }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetPasswordHandler = async (e) => {
    // e.preventDefault();

    const config = {
      header: {
        'Content-Type': 'application/json',
      },
    };

    if (password !== confirmPassword) {
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setError('');
      }, 5000);
      message.error('Passwords do not match');
      return setError("Passwords don't match");
    }

    try {
      const { data } = await axios.put(
        `/api/users/resetpassword/${match.params.resetToken}`,
        {
          password,
        },
        config
      );

      message.success('Password reset');
      console.log(data);
      setSuccess(data.data);
    } catch (error) {
      setError(error.response.data.error);
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
          <h3>ResetPassword</h3>
          <hr />
          <Form layout="vertical" onFinish={resetPasswordHandler}>
            <Form.Item
              type="password"
              label="Password"
              name="Password"
              required
              id="password"
              placeholder="Enter new password"
              autoComplete="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              type="password"
              label="Confirm Password"
              name="Confirm Password"
              required
              id="confirmpassword"
              placeholder="Confirm new password"
              autoComplete="true"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
            <Button htmlType="submit" className="mb-3">
              Reset Password
            </Button>{' '}
            <br />
            <Link to="/login" className="mt-3">
              If done go back to Login
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
export default ResetPasswordScreen;
