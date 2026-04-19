import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transport from "../config/nodemailder.js";
import userAuth from "../middleware/userAuth.js";

//TODO: Learn how to register,jwt and bcrypt to hash password
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "Missing details",
    });
  }
  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      res.json({
        success: false,
        message: "User alread Exists,Please Login",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prodcution",
      sameSite: process.env.NODE_ENV === " prodcution" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Authorization Testing",
      text: `Welcome to authorization testing environment your account has been created with email id :${email}`,
    };

    await transport.sendMail(mailOptions).then(console.log, console.error);

    return res.json({ sucess: true });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Please fill all the informations",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "Please register First",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.json({
        success: false,
        message: "password is not matching",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prodcution",
      sameSite: process.env.NODE_ENV === " prodcution" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ sucess: true });
  } catch (error) {
    return res.json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("taken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prodcution",
      sameSite: process.env.NODE_ENV === " prodcution" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "logged Out",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "not able to logut",
    });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    

    const user = await userModel.findById(userId);

    if (user.isVerified) {
      res.json({
        success: false,
        message: "user already verified",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Authorization Testing: OTP ",
      text: `Your OTP is ${otp}`,
    };

    await transport.sendMail(mailOptions).then(console.log, console.error);

    res.json({
      sucess: true,
      message: "otp send ",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "not able to send otp",
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!otp || !userId) {
    return res.json({
      success: false,
      message: "missing otp",
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "please register your account first",
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "wrong or empty opt",
      });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "otp expired",
      })
   }
    user.isVerified=true;
    user.verifyOtp="";
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "email verified sucessfully",
    });
  }
  catch (error) {
    return res.json({
      success: false,
      message: "not able to verify account using otp",
    });
  }
};


export const isAuthenticated = async (req, res) => {
  try {
    
    res.json({
      success:true,
     
    })
  } catch (error) {
    res.json({
      success:false,
      message:error.message,
    })
  }
}

export const sendResetOtp = async (req,res) =>{
  const {email} = req.body;

  if(!email){
    res.json({
      success:false,
      message:"email is required",
    })

  }

  try {

    const user = await userModel.findOne({email});
    if(!user){
      return res.json({
      success:false,
      message:'user not found',
    })
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Authorization Testing:Password Reset OTP ",
      text: `Your Password Reset OTP is ${otp}`,
    };

    await transport.sendMail(mailOptions).then(console.log, console.error);

    return res.json({
      success:true,
      message:'reset otp sent to your mail to reset password',
    })
    
  } catch (error) {
    return res.json({
      success:false,
      message:error.message,
    })
  }
}

export const resetPassword = async (req,res)=>{

  //get email otp and newPassword
  const {email,otp,newPassword} = req.body;
  //check if everything is available or not
  if(!email || !otp || !newPassword){
    return res.json({
      sucess:false,
      message:"please fill all the fields"
    })
    
  }
  try {
    
    //find user using req.body
    const user = await userModel.findOne({email});
  //if no user then return user not found
  if(!user){
    return res.json({
      sucess:false,
      message:"no user found"
    })
  }
  //if user.resetotp === "" or user.resetotp !== otp return false otp
  if(user.resetOtp === "" || user.resetOtp !== otp){
    return res.json({
      sucess:false,
      message:"wrong otp"
    })
  }
  //check for otp expiry
  if(user.resetOtpExpireAt < Date.now()){
    return res.json({
      sucess:false,
      message:"reset otp expired"
    })
  }
  //otp is valid then update user password
  //first encryptpassword
  const hashedPassword = await bcrypt.hash(newPassword,10);
  //update the password in user database
  user.password = hashedPassword;
  user.resetOtp = '';
  user.resetOtpExpireAt=0;

  await user.save();

  return res.json({
    sucess:true,
    message:'password has been reset sucessfully'
  })
  } catch (error) {
    return res.json({
      sucess:false,
      message:error.message,
    })
  }
 

}