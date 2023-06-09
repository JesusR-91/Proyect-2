const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    image: {
      type: String,
      default: "/images/logo.png",
    },
    rol: {
      type: [String],
      enum: ["professor", "tutor"],
      default: "professor",
    },
    tutorClass: {
      type: Schema.Types.ObjectId,
      ref: "Class",
    },
    admin: {
      type: Boolean,
      default: false,
    },
    class: [
      {
        type: Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
