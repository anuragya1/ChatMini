import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async ({ username, email, password }) => {
  // check for existing username || email 
  const [ existingEmail , existingUsername ] = await Promise.all([
    User.findOne({email}),
    User.findOne({username})
  ])
   
  if(existingEmail){
    throw new Error("Email is already registered ");
  }

  if(existingUsername){
    throw new Error("userName is already registered ");
  }
  const user = await User.create({username,email,password});

  // Generate token after creating a new user 
  const token = generateToken(user._id);
   return ({
    user:{
        id: user._id,
        username: user.username,
        email: user.email
    },
    token
   })

};

export const loginUser = async ({ username, password }) => {
  const user = await User.findOne({ username });

  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) throw new Error("Invalid credentials");

  return {
  user: {
    id: user._id,
    username: user.username,
    email: user.email
  },
  token: generateToken(user._id)
}
};
