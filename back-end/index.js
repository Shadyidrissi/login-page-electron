const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
const prisma = new PrismaClient();
require('dotenv').config();
app.use(express.json());

app.post('/create_user', async(req, res) => {
    try {
        const { username, email ,password} = req.body;

        // التحقق من البيانات المرسلة
        if (!password || !email) {
            return res.status(400).json({ error: "Password and email are required" });
        }

        // Log the data to make sure it's being passed correctly
        console.log(`Creating user with : ${username}`);

        // hash password
        const hashPass = await bcrypt.hash(password, 10);

        // Await the result of the prisma user creation
        const data = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password:hashPass
            },
        });

        // استجابة مع بيانات المستخدم الذي تم إنشاؤه
        res.status(200).json({
            message: "User created successfully",
            dataCreate: data,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message });
    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!password || !email) {
            return res.status(400).json({ error: "Password and email are required" });
        }

        // Fetch the user by email
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Successful login
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
