const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

// @desc  User Signup
// @route POST /api/users
// @access Public

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    //Check body
    if (!name || !email || !password) {
        res.status(400)
        throw new Error('Please enter all the fields')
    }

    //Check registered user or not
    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    //Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //Create User
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token:generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }

    res.json({
        message: 'Registered User'
    })
})

// @desc  User Login
// @route POST /api/users/login
// @access Public

const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({ email })
  
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      })
    } else {
      res.status(400)
      throw new Error('Invalid credentials')
    }
})

// @desc  GET user data (middleware)
// @route GET /api/users/me
// @access Private

const getD = asyncHandler(async(req, res) => {
    res.json({
        message: 'User data'
    })
})


// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
  }

module.exports = {
    registerUser,
    loginUser,
    getD
}