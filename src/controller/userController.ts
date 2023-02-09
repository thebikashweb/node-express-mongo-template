import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { createUser } from "../Services/userService";

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  //TODO - all the validation such as email, and required can be done here
  //check if the user already exist
  if (email) {
    try {
      let user = await User.findOne({ email });
      if (user) {
        res.status(403).json("Email already exist");
      } else {
        //TODO password hash
        user = await createUser(req.body);
        res.status(201).json(user);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal server error");
    }
  } else {
    res.status(400).json("Bad request");
  }
};
