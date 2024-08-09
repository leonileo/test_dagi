const asyncHandler = require("express-async-handler");

const Profile = require("../models/Profile");
const User = require("../models/User");
const Blog = require("../models/Blog");
const { userRoleChangedEmail, userBlockEmail } = require("../utils/mail");//NOT>>

// @Desc    Convert a user to admin or admin to user
// @Route   POST /admin/toggleRole
// @Access  Private


const toggleRole = asyncHandler(async (req, res) => {
    const { userId } = req.body;//The user whoose role we want to change

    // Check if userId and loggedInUser are same
    //Check if the admin is trying to change their own role. If yes, return an error.
    if (userId.toString() === req.user._id.toString()) {
        res.status(400)
        throw new Error('You can not change your role')
    }

    //Find the user by userId in the database, excluding the password field.
    // Check if user exists
    const userExists = await User.findById(userId).select('-password');

    if (!userExists) {
        res.status(400)
        throw new Error('No such user exists');
    }

    // Find profile
    /* Toggle Role: Check the current role of the user:
    If the role is 'user', change it to 'admin'.
    If the role is 'admin', change it to 'user'. */
    const profile = await Profile.findOne({ user: userId });
    if (profile.role == 'user') {
        profile.role = 'admin';
    }
    else if (profile.role == 'admin') {
        profile.role = 'user';
    }
    await profile.save();
    /* Save the updated profile to the database. */

    // Send email when user role changed
    userRoleChangedEmail({ to: userExists.email, isAdminNow: profile.role === 'admin' });//NOT>>

    /* 
    ...userExists._doc: Copy the user details (excluding the password).
    profile: Add the updated profile information.
    blogs: Find and include the user's blogs, with additional details (like profile and category) populated.
    */

    let response = { ...userExists._doc };
    response['profile'] = profile;
    response['blogs'] = await Blog.find({ user: userId }).populate('profile').populate('category');

    res.status(200).json(response);
})

// @Desc    Toggle isBlocked property
// @Route   POST /admin/toggleBlock
// @Access  Private

const toggleBlock = asyncHandler(async (req, res) => {
    const { userId } = req.body;// ID of the user whose block status we want to toggle.

    // Check if userId and loggedInUser are same
    if (userId.toString() === req.user._id.toString()) {
        res.status(400)
        throw new Error('You can not block yourself')
    }

    // Check if user exists
    const userExists = await User.findById(userId).select('-password');

    if (!userExists) {
        res.status(400)
        throw new Error('No such user exists');
    }

    // Find profile
    const profile = await Profile.findOne({ user: userId });
    profile.isBlocked = !profile.isBlocked;
    await profile.save();

    // Send email when user gets block/unblock
    userBlockEmail({ to: userExists.email, isBlockNow: profile.isBlocked })//NOT>>

    let response = { ...userExists._doc };
    response['profile'] = profile;
    response['blogs'] = await Blog.find({ user: userId }).populate('profile').populate('category');

    res.status(200).json(response);

})

// @Desc    Get All users list
// @Route   POST /admin/getAllUsers
// @Access  Private

//queries the database to retrieve all user documents.
//getAllUsers retrieves all users from the database, along with their profiles and blogs, and sends this data back as a response.
//asyncHandler to handle any errors that might occur during execution.
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');
    let responseArr = [];

    for (let i = 0; i < users.length; i++) {
        let currUser = { ...users[i]._doc };
        //This line fetches the profile associated with the current user and adds it to the currUser object under the profile key.
        currUser['profile'] = await Profile.findOne({ user: users[i]._id });
        //This line fetches all blogs associated with the current user and adds them to the currUser object under the blogs key.
        currUser['blogs'] = await Blog.find({ user: users[i]._id });
        //This adds the current user's complete information (with their profile and blogs) to the list we created earlier.
        responseArr.push(currUser);
    }
    res.status(200).json(responseArr);

})

// @Desc    Get user from userId 
// @Route   POST /admin/getUserDetailsByUserId
// @Access  Private
const getUserDetailsByUserID = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const userExists = await User.findById(userId).select('-password');

    if (!userExists) {
        res.status(400)
        throw new Error('No such user exists');
    }

    let response = { ...userExists._doc };
    response['profile'] = await Profile.findOne({ user: userId });;
    response['blogs'] = await Blog.find({ user: userId }).populate('profile').populate('category');

    res.status(200).json(response);
})

module.exports = {
    toggleRole,
    toggleBlock,
    getAllUsers,
    getUserDetailsByUserID
};