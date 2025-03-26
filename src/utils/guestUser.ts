import guestUserModel from "../model/guestUser.model";
import { v4 as uuidv4 } from "uuid";

export const createGuestUser = async (fingerprint: string) => {
  const uuid = uuidv4();
  const guestUser = new guestUserModel({ uuid, fingerprint, role: "guest" });
  await guestUser.save();
  return guestUser;
};
