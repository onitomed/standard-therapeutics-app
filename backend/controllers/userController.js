const jwt = require('jsonwebtoken')
const brcypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const bcrypt = require('bcryptjs/dist/bcrypt')
const Patient = require('../models/patientModel')

//  @desc    Register user
//  @route   POST /api/users
//  @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body

    // Form validation
    if(!name || !email || !password) {
        res.status(400)
        throw new Error("Please add all fields")
    }
    // Check if user exists
    const userExists = await User.findOne({email})
    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await brcypt.hash(password, salt)
    let user = null
    if (role == 'doctor') {
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            roles: ['patient','doctor']
        })
    }
    else {
        user = await User.create({
            name,
            email,
            password: hashedPassword
        })
    }
    // Create user
    

    if(user) {
        const patient = await Patient.create({
            name: user.name,
            dependent: false,
            root: true,
            users: [user.id, process.env.ROOT_USER_ID]
        })
        if (patient) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id,patient._id),
                roles: user.roles,
                patientId: patient._id
            })
        } else {
            res.status(400)
            throw new Error('Unable to create patient profile')
        }
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }

})

//  @desc    Authenticate a user
//  @route   POST /api/users/login
//  @access  Public
const loginUser = asyncHandler(async (req, res) => {
    
    // Form validation
    const { email, password } = req.body
    if(!email || !password) {
        res.status(400)
        throw new Error("Please add all fields")
    }

    // Check for user email
    const user = await User.findOne({email})
    
    // Password check
    if(user && (await brcypt.compare(password, user.password))) {
        const patient = await Patient.findOne({users:user.id, root: true, "users.0":user.id})
        if (patient) {
            res.status(200).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id, patient._id),
                roles: user.roles,
                patientId: patient._id
            }) 
        }
        else {
            res.status(401)
            throw new Error('Invalid patient credentials')
        }
        
    } else {
        res.status(400)
        throw new Error('Invalid credentials')  
    }
})

//  @desc    Get user data
//  @route   GET /api/users/me
//  @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(
        {
            _id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            roles: req.user.roles,
            patientId: req.patient._id
        }
    )
})

//  Generate JWT
const generateToken = (id,pid) => {
    return jwt.sign({ id,pid }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    })
}
const generateTokenUserOnly = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    })
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
}