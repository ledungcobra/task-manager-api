const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')


const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({
    storage:storage,
    limits:{
        fileSize:2097152,

    },
    fileFilter(req,file,cb){
        
        if(!file.originalname.match(/.*\.(docx?|jpg)/)){
            return cb(new Error('Please upload a image or word file'))
        }

        cb(undefined,true)
                
    }
}).single('avatar')
const fs = require('fs')
//List out all users
router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)     
})
//Login
router.post('/users/login',async (req,res)=>{

    try{
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        )
        const token = await user.generateAuthToken()
        
        res.send({token,user})
        
    }catch(e){
        res.status(400).send('Unable to login 4')
    }
})
//Logout one user
router.post('/users/logout',auth,async (req,res)=>{
    try{
    
        req.user.tokens = req.user.tokens.filter((tok)=>tok.token !== req.token)
        await req.user.save()
        res.send('Logged out')
    }catch(e){
        console.log(e)
    }
      
})

//Logout all user

router.post('/users/logoutAll',auth,async(req,res)=>{

    try {
        
        req.user.tokens = []
        await req.user.save()
        res.send('Logged out all successfully')

    } catch (error) {
        res.status(500).send({error:'Unable to logout all user'})
    }

})

//Get specific user
router.get('/users/:id', async (req,res)=>{
    const _id = req.params.id
    try{    
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user)

    }catch(e){
        res.status(500).send()
    }

})
//Update specific user
router.patch('/users/me', auth,async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=>{
        return allowUpdates.includes(update)
    })

    if(!isValidOperation) return res.status(400).send('Invalid update');

    try{
        const user = req.user
        updates.forEach((update)=>{
            user[update] = req.body[update]
        })
        await user.save()

        if(!user){
            return res.status(404).send();
        }            
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})
//Delete one user by id
router.delete('/users/me',auth,async(req,res)=>{
    
    try{
        
        await req.user.remove()
        res.send(req.user)

    }catch(e){
        res.status(400).send(e)
    }

})
//Register a new user
router.post('/users',async (req,res)=>{
    const user = new User(req.body)    
    try{
        await user.save() 
        const token =await user.generateAuthToken()
        res.status(201).send({user,token})

    }catch(e){
        res.status(400).send(e)
    }
})


//Upload avatar image
router.post('/users/me/avatar',auth,upload,async(req,res)=>{
    
  
        try{
            const buffer = await sharp(req.file.buffer).resize(300,300).png().toBuffer();

            req.user.avatar = buffer 
            await req.user.save()    
            res.send()
        }catch(e){
            res.status(500).send()
        }
       
    
  
    
},(error,req,res,next)=>{
    try{
        res.status(400).send(error.message)
    }catch(e){
        res.status(400).send()
    }
    
    next()
})

//Delete user avatar
router.delete('/users/me/avatar',auth,async(req,res)=>{

    try{
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    }catch(e){
        res.status(400).send()
    }

})
//Get user avatar
router.get('/users/:id/avatar',async (req,res)=>{
    try{
    const user = await User.findById(req.params.id)
    if(!(user&&user.avatar)){
        return new Error()
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})
module.exports = router
