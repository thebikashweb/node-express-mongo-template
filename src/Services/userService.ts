import User from "../models/User";

import { UserPayloadType } from "../types";

export const createUser = async (payload: UserPayloadType) => {
  if (!payload.email || !payload.firstName || !payload.lastName)
    throw new Error("Missing required paramaters");

  try {
    let user = new User(payload);
    await user.save();
    return user;
  } catch (error) {
    Error(error);
  }
};
