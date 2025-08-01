import { envVars } from "../config/env";
import { IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedAdmin = async () => {
  try {
    const isAdminExist = await User.findOne({
      phone: envVars.ADMIN_PHONE,
    });
    if (isAdminExist) {
      console.log("Admin Already Exists!");
      return;
    }

    console.log("Trying to create Admin.........");

    const hashedPin = await bcryptjs.hash(
      envVars.ADMIN_PIN,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const payload: IUser = {
      name: "admin",
      role: Role.ADMIN,
      email: "admin@gmail.com",
      pin: hashedPin,
      phone: "01700000000",
      address: "Sylhet",
      isBlocked: false,
    };

    const admin = await User.create(payload);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pin, ...adminSafe } = admin.toObject();

    console.log("[Notification] Admin Created Successfully!");
    console.log(adminSafe);
  } catch (error) {
    console.log(error);
  }
};
