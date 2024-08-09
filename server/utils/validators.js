module.exports.validateRegisterInput = (
    email,
    name,
    password
) => {
    //Initialize errors object: Creates an empty object to store any validation errors.
    const errors = {};
    if (!name || name.trim() === '') {
        errors.fields = 'Please add all fields';
    }

    //If Missing: If the email is missing or blank, it adds an error message to errors.fields
    if (!email || email.trim() === '') {
        errors.fields = 'Please add all fields';
    } else {
        //If Present: If the email format is invalid, it adds an error message to errors.email
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            errors.email = 'Email must be a valid email address';
        }
    }
    if (!password || password === '') {
        errors.fields = 'Please add all fields';
    }
    else if (password.length < 6) {
        errors.password = 'Password must be length of greater than 6'
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
        /* errors: Object with error messages.
valid: true if no errors, false if there are errors. */
    };
};
