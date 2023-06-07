// const express = require('express');
// const router = express.Router();
// const User = require('../models/userModel.js');

// const jwt = require('jsonwebtoken');
// const { invalid } = require('moment/moment.js');

// const genToken = (id) => {
//   return jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: '60d' });
// };

// router.post('/register', async (req, res) => {
//   // const { username } = req.body;
//   // const isNewUser = await User.isThisEmailInUse({ username });
//   // if (!isNewUser) {
//   //   return res.send({
//   //     success: false,
//   //     message: 'Username Already Exists',
//   //   });
//   // }

//   //   try {
//   //     const newuser = new User(req.body);
//   //     const user = await newuser.save();
//   //     if (user) {
//   //       res.status(201).json({
//   //         _id: user._id,
//   //         token: genToken(user._id),
//   //       });
//   //     }
//   //     res.send('User Created Successfully');
//   //   } catch (error) {
//   //     return res.status(400).json(error);
//   //   }
//   // });

//   const { username, email, password } = req.body;

//   const userExists = await User.findOne({ email });
//   if (userExists) {
//     res.status(400).send('User already exists');
//   }

//   const user = await User.create({ username, email, password });

//   if (user) {
//     res.status(201).json({
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//       token: genToken(user._id),
//     });
//   } else {
//     res.json(400);
//     throw new Error('Invaild user data');
//   }
// });

// router.post('/forgotPassword', async (req, res) => {
//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       res.status(400).send('User already exists');
//     }
//     const newuser = new User(req.body);
//     const user = await newuser.save();
//     res.send('User Created Successfully');
//   } catch (error) {
//     return res.status(400).json(error);
//   }
// });

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (user && (await user.matchPasswords(password))) {
//     res.json({
//       _id: user._id,
//       token: genToken(user._id),
//     });
//   } else {
//     res.status(401);
//     throw new Error('invalid Credential');
//   }
// });

// router.post('/update', async (req, res) => {
//   try {
//     await User.findOneAndUpdate({ _id: req.body._id }, req.body);

//     const user = await User.findOne({ _id: req.body._id });

//     res.send(user);
//   } catch (error) {
//     return res.status(400).json({ error });
//   }
// });

// router.get('/getallusers', async (req, res) => {
//   try {
//     const users = await User.find();
//     res.send(users);
//   } catch (error) {
//     return res.status(400).json({ error });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/userModel.js');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { invalid } = require('moment/moment.js');

// const genToken = (id) => {
//   return jwt.sign({ id }, process.env.TOKEN_SECRET, {
//     expiresIn: process.env.TOKEN_EXPIRE,
//   });
// };

router.post('/register', async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    /** create an user */
    const user = await User.create({
      username,
      email,
      password,
    });

    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
});

router.post('/forgotPassword', async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('Email does not exist', 404));
    }

    /** Reset Token Gen and add to database hashed (private) version of token */
    const resetToken = user.getresetPasswordToken();

    await user.save();

    /** create reset url to email to provide the email  */
    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;
    /** HTML message */
    const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password</p>
            <a href=${resetUrl} clicktracking=off >${resetUrl}</a>
        `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse('Email could not be send', 500));
    }
  } catch (error) {
    next(error);
  }
});

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   const isMatch = await user.matchPasswords(password);
//   if (user && isMatch) {
//     res.json({
//       _id: user._id,
//       token: sendToken(user, 200, res),
//       // sendToken: sendToken(user, 200, res),
//     });
//   } else {
//     res.status(401);
//     throw new Error('invalid Credential');
//   }
// });
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  /** Check if email and password is provided */
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    /** Check that user exists by email */
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    /** Check that password match */
    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/update', async (req, res) => {
  try {
    await User.findOneAndUpdate({ _id: req.body._id }, req.body);

    const user = await User.findOne({ _id: req.body._id });

    res.send(user);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.get('/getallusers', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.put('/resetpassword/:resetToken', async (req, res, next) => {
  /** compare token in url params to hashed token */
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid Token', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: 'Password Updated Success',
    });
  } catch (error) {
    next(error);
  }
});
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ _id: user._id, success: true, token });
};

module.exports = router;
