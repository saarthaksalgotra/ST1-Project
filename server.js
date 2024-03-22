
const express = require('express');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();


const User = require('./models/User');


const app = express();


mongoose.connect('mongodb://127.0.0.1:27017/OTP');
 
app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'hbs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'saarthaksalgotra5@gmail.com',
    pass: process.env.PASS,
  },
})


app.get('/', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000);

    const newUser = new User({
      username,
      password: hashedPassword,
      otp,
    });

    
    await newUser.save();

    await transporter.sendMail({
      from: 'saarthaksalgotra5@gmail.com',
      to: username,
      subject: 'OTP for Registration',
      text: `Your OTP for registration is: ${otp}`,
    });

    console.log(`OTP sent to ${username}`);

    res.render('verify', { username });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).send('Server error');
  }
})

app.post('/verify', async (req, res) => {
    const { username, otp } = req.body;
  
    try {
      const user = await User.findOne({ username });
  
      if (!user || user.otp !== otp) {
        return res.status(401).send('Invalid OTP');
      }
  
      user.otp = '';
      await user.save();
  
      res.send('OTP verified successfully');

    } catch (error) {
      console.error('Error in verification:', error);
      res.status(500).send('Server error');
    }
  })


app.listen(3000, () => {
  console.log("http://localhost:3000");
})