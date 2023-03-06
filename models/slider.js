const mongoose = require('mongoose');

const sliderSchema= mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    miniTitle: {
        type: String
    },
    description: {
        type: String,
        default : '',
        required: true,
    },
    enable: {
        type: Boolean,
        default:true
    },
    image: {
        type: String,
        default: ''
    },
    order: {
        type: Number
    },
    url: {
        type: String,
        default: ''
    },
})

sliderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

sliderSchema.set('toJSON', {
    virtuals: true,
});

exports.Slider = mongoose.model('Slider', sliderSchema);