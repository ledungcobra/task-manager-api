const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const mongodb = require('mongodb')
const ObjectID = mongodb.ObjectID 
const Task = require('../models/task')
const mongoose = require('../db/mongoose')
router.post('/tasks',auth,async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try{
        await task.save()
        res.status(200).send(task)
    }catch(e){
        res.status(400).send(e)
    }
    
})



router.get('/tasks',auth,async (req,res)=>{
    try{
        const match = {}
        const sort = {}
        if(req.query.completed){
            match.completed = req.query.completed === 'true'
        }
    
        if(req.query.sortBy){
            const result = req.query.sortBy.split(':')
            sort[result[0]] = result[1] === 'asc'? 1:-1
        }
       
        
        const user = req.user
        await user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(user.tasks)

    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/tasks/:id',auth, async (req,res)=>{
    const _id = req.params.id
    try{

        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(400).send('No tasks found')
        }
        res.send(task)

    }catch(e){
        res.status(500).send(e)
    }
})



router.patch('/tasks/:id',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowUpdates = ['description','completed']
    const isValidOperation = updates.every((update)=>allowUpdates.includes(update))
    
    if(!isValidOperation){
        
        return res.status(400).send('Invalid update')
      
    }
    try{
     
        //const updatedTask = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task) return res.status(404).send('Couldn\'t find this task')
        
        updates.forEach((update)=>task[update] = req.body[update])
        await task.save()
        
        res.send(task)
    }catch(e){
        return res.status(400).send('Error')
    }
})

//Delete a specific task
router.delete('/tasks/:id',auth, async function (req, res){
    try{
       
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        
        if(!task) return res.status(404).send()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})
module.exports = router
