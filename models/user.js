const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");
const validator = require("validator");
const { Post } = require("../models/post");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        const regex = /^[\p{L}. ]+[\p{N}]*$/u;
        if (!regex.test(value)) {
          const errors = new Error(
            "The name must only contain letters or ends with numbers"
          );
          errors.code = 400;
          throw errors;
        }
      },
      minlength: [5, "name must be gretar than 5 charactar"],
      maxlength: [50, "name must be less  50 charactar"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [5, "name must be gretar than 5 charactar"],
      maxlength: [50, "name must be less  50 charactar"],
      validate(value) {
        if (!validator.isEmail(value)) {
          const errors = new Error("is not valid Email");
          errors.code = 400;
          throw errors;
        }
      },
      validate(value) {
        const regex = /^\w+[\+\.\w-]*@([\w-]+.)*\w+[\w-]*.([a-z]{2,4}|d+)$/i;
        if (!regex.test(value)) {
          const errors = new Error("please check email is correct");
          errors.code = 400;
          throw errors;
        }
      },
    },
    imageUrl: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "name must be gretar than 5 charactar"],
      maxlength: [200, "name must be less  50 charactar"],
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a postive number");
        }
      },
    },
    confirm: {
      type: Boolean,
      default: false,
    },
    tokens: {
      type: [String],
      required: true,
    },
    friendsPrivacy: {
      type: String,
      enum: ["PUBLIC", "PRIVATE" , "FRIENDS"],
      default: "FRIENDS",
    },
  },
  { timestamps: true, toObject: { virtuals: true } }
);

userSchema.index({ name: "text" });

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
  user.tokens.push(token);
  await user.save();

  return token;
};

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "author",
});

userSchema.virtual("stories", {
  ref: "Story",
  localField: "_id",
  foreignField: "author",
});

userSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "author",
});
//for login
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    const errors = new Error("invalid input");
    errors.data = "email not found";
    errors.code = 400;
    throw errors;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const errors = new Error("invalid input");
    errors.data = "password is not correct";
    errors.code = 400;
    throw errors;
  }

  if (user.confirm != true) {
    const errors = new Error("acount not activated");
    errors.data = "please activate your account";
    errors.code = 401;
    throw errors;
  }

  return user;
};

//validate login
userSchema.statics.validateLogin = (userInput) => {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email({ tlds: { allow: ["com", "net"] } })
      .regex(/^\w+[\+\.\w-]*@([\w-]+.)*\w+[\w-]*.([a-z]{2,4}|d+)$/i)
      .message("please check your email"),
    password: Joi.string().min(5).max(50).required(),
  };

  const { error } = Joi.object(schema).validate(userInput);

  if (error) {
    const errors = new Error("invalid input");
    errors.data = error.details[0].message;
    errors.code = 400;
    throw errors;
  }
};

//validate create user
userSchema.statics.validateUser = (user) => {
  const schema = {
    image: Joi.any(),
    name: Joi.string()
      .min(5)
      .max(50)
      .required()
      .regex(/^[\p{L}. ]+[\p{N}]*$/u)
      .message("please check your name"),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email({ tlds: { allow: ["com", "net"] } })
      .regex(/^\w+[\+\.\w-]*@([\w-]+.)*\w+[\w-]*.([a-z]{2,4}|d+)$/i)
      .message("please check your email"),
    password: Joi.string().min(5).max(50).required(),
    age: Joi.number().min(0),
  };

  const { error } = Joi.object(schema).validate(user);

  if (error) {
    const errors = new Error("invalid input");
    errors.data = error.details[0].message;
    errors.code = 400;
    throw errors;
  }
};

//validate update user
userSchema.statics.validateUpdateUser = (user) => {
  const schema = {
    image: Joi.any(),
    name: Joi.string()
      .min(5)
      .max(50)
      .regex(/^[\p{L} ]+\p{N}*$/u)
      .message("please check your name"),
    age: Joi.number().min(0),
  };

  const { error } = Joi.object(schema).validate(user);

  if (error) {
    const errors = new Error("invalid input");
    errors.data = error.details[0].message;
    errors.code = 400;
    throw errors;
  }
};

//hash password before save
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//delet all post after delet my profile
userSchema.pre("remove", async function (next) {
  const user = this;
  await Post.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

exports.User = User;
