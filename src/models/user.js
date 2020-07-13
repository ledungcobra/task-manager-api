const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({

    name:{
        type:String,
        trim:true,
        required:true
        
    },
    email:{
        unique:true,
        type:String,
        dropDups:true,
        required:true,
       
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email address is not valid")
            }
        }
    },
    password: {
        type:String,
        required:true,
        trim:true,
        minlength: 7,
        validator(value){

            if(value.toLowerCase().includes("password")){
                throw new Error("Password cannot contain 'password' ")
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error("Age must be a positive number")
            }
        }
    },
    tokens:[
        {
            token:{
                type:String,
                required:true,
            }
        }
    ],
    avatar:{
        type:Buffer
    }
},{timestamps:true})

userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET,{expiresIn:'10 days'})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject._id
    delete userObject.avatar
    

    return userObject
}
//Hash plain text before saving
userSchema.statics.findByCredentials =async (email,password) => {
    
    try{
        
        const user = await User.findOne({email})        
    
        if(!user){        
            throw new Error('Unable to login 1' )
        }
        const validPassword = await bcrypt.compare(password,user.password)
        
        if(validPassword === true){          
            return user
        }else{
            throw Error('Unable to login 2')
        }

    }catch(e){
        
        throw Error('Unable to login 3' )
    }
}
userSchema.pre('save',async function (next){
    const user = this  
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

//Delete the tasks when the user is removed


userSchema.pre('remove',async function(next){

    try{
        const user = this
        await Task.deleteMany({owner: user._id})
    }catch(err){
        console.log(err)
    }
    



    next()

})
const User = mongoose.model("Users",userSchema) 
module.exports = User
