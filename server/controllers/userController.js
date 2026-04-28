import userModel from "../models/userModel.js";

export const getUserData = async(req,res)=>{
    try {
        const {userId} = req.body;
        //find user using userid
        const user = await  userModel.findById(userId);
        //check if user exists
        if(!user){
            return res.json({
            success:false,
            message:"user not found",
        })}

       return res.json({
            success:true,
            userData:{
                name:user.name,
                isVerified:user.isVerified
            }
        });
        
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}
