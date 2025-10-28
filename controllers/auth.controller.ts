import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import bcryptjs from "bcryptjs";
import db from "../config/db.config";
import { IUser } from "../models/auth.model";
const { exec } = require("child_process");
const util = require("util");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const otp = Math.floor(100000 + Math.random() * 900000);

// Child processes : exec, execFile, spawn, fork
const execPromise = util.promisify(exec);
async function executeCommand(command: any) {
  try {
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
    }
    console.log(`Command output:\n${stdout}`);
    return stdout;
  } catch (error: any) {
    console.error(`Error executing command: ${error.message}`);
    throw error;
  }
}
executeCommand("node --version")
  .then((version) => console.log(`Node.js version: ${version.trim()}`))
  .catch((err) => console.error("Failed to get Node.js version"));

// Worker threads
const { Worker } = require("worker_threads");
function runWorker(workerData: any) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code: number) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}
async function run() {
  try {
    const result = await runWorker("Hello from main thread!");
    console.log("Worker result:", result);
  } catch (err) {
    console.error("Worker error:", err);
  }
}
run().catch((err) => console.error(err));

const getAllUsers: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { userId } = request.params;
    const [users] = (await db.query(
      "SELECT * FROM users WHERE NOT id = ?",
      userId
    )) as unknown as [IUser];

    if (!users) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No users available!"
      );
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Users fetched successfully!",
      users
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const signup: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const reqBody = await request.body;
    const { name, email, password } = reqBody;
    const [[user]] = (await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as unknown as [[IUser]];

    if (user) {
      APIResponse(response, false, HTTP_STATUS.CREATED, "User already exists!");
      return;
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const [userCreated] = (await db.query(
      "INSERT INTO users (name, email, password, image, isAdmin, cart) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, "", false, "[]"]
    )) as unknown as [IUser];

    if (!userCreated) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Something went wrong!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.CREATED,
      "Registration successful!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const signin: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqBody = await request.body;
    const { password, email } = reqBody;
    const [[user]] = (await db.query(
      "SELECT * FROM users WHERE email = ? OR name = ?",
      [email, email]
    )) as unknown as [[IUser]];

    if (!user) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, "User not found!");
      return;
    }

    const validatePassword = await bcryptjs.compare(password, user.password);

    if (!validatePassword) {
      APIResponse(response, false, 401, "Invalid username or password!");
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const loggedInUser = {
      id: user.id,
      image: user.image,
      name: user.name,
      email: user.email,
      contact: user.contact,
      isAdmin: user.isAdmin ? true : false,
      address: user.address,
    };

    const options: any = {
      maxAge: process.env.EXPIRES_TIME,
      httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") options.secure = true;

    response.cookie("token", token, options);

    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Login successful!", {
      user: loggedInUser,
      token,
      cart: user.cart,
    });
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const sendOtpMail: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqBody = await request.body;
    const { email } = reqBody;

    if (!email) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Email should not be empty!"
      );
      return;
    }

    const [[user]] = (await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as unknown as [[IUser]];

    if (!user) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "User not found, Please create new account!"
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bigbite.0110@gmail.com",
        pass: "kseb rvrh avds cuib",
      },
    });

    (async () => {
      await transporter.sendMail({
        from: '"Big Bite" <bigbite.0110@gmail.com>',
        to: email,
        subject: "🔐 Verify Your Email - Bigbite",
        html: `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center;">
    <div style="margin: auto; background: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="background-color: #ff4b2b; padding: 20px 0;">
        <h2 style="color: white; margin: 0;">Bigbite</h2>
      </div>

      <div style="padding: 30px;">
        <h3 style="color: #333;">Email Verification</h3>
        <p style="color: #555; font-size: 15px; line-height: 1.6;">
          Use the following One Time Password (OTP) to verify your email address with <b>Big Bite</b>.
        </p>

        <div style="margin: 25px 0;">
          <span style="font-size: 32px; letter-spacing: 8px; color: #ff4b2b; font-weight: bold;">${otp}</span>
        </div>

        <p style="color: #777; font-size: 14px;">
          This OTP will expire in <b>10 minutes</b>. Please do not share this code with anyone.
        </p>

        <div style="margin-top: 30px;">
          Thank you.
        </div>
      </div>

      <div style="background-color: #fafafa; padding: 15px; font-size: 12px; color: #999;">
        <p>© ${new Date().getFullYear()} Bigbite. All rights reserved.</p>
      </div>
    </div>
  </div>
  `,
      });

      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Email with otp has sent!"
      );
    })();
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const verifyOtp: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqBody = await request.body;
    const { email, otp: reqOtp } = reqBody;

    if (!email) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Email should not be empty!"
      );
      return;
    }

    const [[user]] = (await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as unknown as [[IUser]];

    if (!user) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "User not found, Please create new account!"
      );
      return;
    }

    if (otp !== Number(reqOtp)) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "OTP must match with email!"
      );
      return;
    }

    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Email verified!");
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updatePassword: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqBody = await request.body;
    const { email, password } = reqBody;

    if (!password) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Password should not be empty!"
      );
      return;
    }

    const [[user]] = (await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as unknown as [[IUser]];

    if (!user) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "User not found, Please create new account!"
      );
      return;
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const [userCreated] = (await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, user.id]
    )) as unknown as [IUser];

    if (!userCreated) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Something went wrong!"
      );
      return;
    }

    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Password updated!");
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const deleteUserById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [user] = (await db.query(
      "DELETE FROM users WHERE id = ?",
      id
    )) as unknown as [IUser];

    if (user.affectedRows !== 1) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.NOT_FOUND,
        "Something went wrong!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "User deleted successfully!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

// Monitoring
const sendMonitoringDetails: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const memoryUsage = process.memoryUsage();
  const rss = Math.round(memoryUsage.rss / 1024 / 1024);
  const totalHeap = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const usedHeap = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const external = Math.round(memoryUsage.external / 1024 / 1024);
  const uptime = Math.round(process.uptime() / 60);
  const cpuUsage = process.cpuUsage();
  const cpu = {
    user: Math.round(cpuUsage.user / 1024 / 1024),
    system: Math.round(cpuUsage.system / 1024 / 1024),
  };

  APIResponse(
    response,
    true,
    HTTP_STATUS.SUCCESS,
    "Monitor details fetched successfully!",
    {
      rss,
      totalHeap,
      usedHeap,
      external,
      cpu,
      uptime,
    }
  );
};

export default {
  getAllUsers,
  signup,
  signin,
  sendOtpMail,
  verifyOtp,
  updatePassword,
  deleteUserById,
  sendMonitoringDetails,
};
