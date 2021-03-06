export default values => {
    const errors = {};
    if (!values.name) {
        errors.name = 'Please enter your name';
    } else if (values.name.length > 25) {
        errors.name = 'Name should be less than 25 characters';
    }
    if (!values.message) {
        errors.message = 'Please enter a message';
    } else if (values.message.length > 3000) {
        errors.name = 'Message should be less than 3000 characters';
    }
    if (!values.email) {
        errors.email = 'Please enter a valid email';
    } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}$/i.test(values.email)
    ) {
        errors.email = 'Please enter a valid email';
    }

    return errors;
};
