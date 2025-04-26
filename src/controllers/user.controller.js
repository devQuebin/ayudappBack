const User = require('./models/User');


const createUser = async (req, res) => {
    try {
        const { userId, name, lastName, email, campaignRecord, donationRecord, password } = req.body;

        const newUser = new User({
            userId,
            name,
            lastName,
            email,
            password,
            campaignRecord,
            donationRecord,
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user' });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById
};
