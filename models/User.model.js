const mongoose = require("mongoose");

const { Schema, model } = mongoose;

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, 'Username is Required'],
      unique: true
    },
    email: {
      type: String,
      required: [true, 'Email is Required'],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    pokemon: {
      type: [mongoose.Types.ObjectId],
      ref: "Pokemon"
    },
    Admin: {type: Boolean, default: false},
    active: {type: Boolean, default: false}
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
