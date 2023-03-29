const express=require('express')
const Task=require('../models/task');
const auth=require('../middleware/auth')
const router=new express.Router()

router.post('/api/tasks',auth,async (req,res)=>{
    // const task=new Task(req.body)

    const task=new Task({
        ...req.body,
        owner:req.user._id
    })
    try{
        await task.save();
        res.status(201).send(task)
    }catch(error){
        res.status(404).send(error)
    }
})

// GET / /api/tasks?completed=true
// GET / /api/tasks?limit=10&skip=20
// GET / /api/tasks?sortBy=createAt:desc
router.get('/api/tasks',auth, async (req,res)=>{
    const match={}
    const sort={}

    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }

    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc' ? -1 : 1
    }

    try{
        //const tasks= await Task.find({owner: req.user._id}); 
        // or
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        })
        const tasks=req.user.tasks
        if(!tasks){
            return res.status(404).send()
        }
        res.send(tasks)
    }catch(error){
        res.status(500).send(error)
    }
})

router.get('/api/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id
    try{
        const task=await Task.findOne({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)

    }catch(error){
        res.status(500).send(error)
    }
})

router.patch('/api/tasks/:id',auth, async (req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdate=['description','completed']
    const isValidOperation=updates.every((update)=> allowedUpdate.includes(update))
   if(!isValidOperation){
       return res.status(400).send({ error: "Invalide Update" })
   }
   try{
       const task=await Task.findOne({_id:req.params.id, owner:req.user._id})

       if(!task){
           return res.status(404).send()
       }

       updates.forEach((update)=> task[update]=req.body[update])
       await task.save()

       res.send(task)
   }catch(err){
       res.status(400).send(err)
   }
})

router.delete('/api/tasks/:id', auth,async (req,res)=>{
    try{
        const _id=req.params.id
        const task=await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send("Task not exist")
        }
        res.send(task)
    }catch(err){
        res.status(500).send(err)
    }
 })

module.exports=router