const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const Trainer = require("../models/Trainer");


const pokeSchema = new Schema({
    name: String,
    type: String, 
    img: String, 
    // even though we upload an image, this property will still be a string
    // because we will upload an image to a 3rd party server and get a url for it
    // and the url is what we will save to our Pokemon model
    evolves: Boolean,
    moves: [String],
    adopted: {type: Boolean, default: false}
});


const Pokemon = mongoose.model('Pokemon', pokeSchema);


module.exports = Pokemon;