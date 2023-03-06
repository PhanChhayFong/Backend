const mongoose = require('mongoose');

const companySchema= mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    telephone: {
        type: String,
        default : '',
        required: true,
    },
    facebook: {
        type: String,
        default:true
    },
    twitter: {
        type: String
    },
    telegram: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
})

exports.Company = mongoose.model('Company', companySchema);