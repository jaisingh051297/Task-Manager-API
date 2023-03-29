const express=require('express');
const User=require('../models/user');
const auth=require('../middleware/auth')
const jwt=require('jsonwebtoken');
const multer=require('multer');
const sharp=require('sharp')
const router=new express.Router()

router.post('/api/users',async (req,res)=>{
    const user=new User(req.body)
    try{
        await user.save();
        const token= await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(err){
        res.status(404).send(err)
    }
})

router.post('/api/users/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token= await user.generateAuthToken()
        res.send({ user, token})

    }catch(error){
        res.status(400).send(error)
    }
})

const upload =multer({
    limits:{
        fileSize:2000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an Image'))
        }
        cb(undefined,true)
    }
})

router.post('/api/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send(req.user)
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/api/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/api/users/:id/avatar',async (req,res)=>{
    try{
        const user= await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(error){
        res.status(404).send()
    }
})



router.post('/api/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens= req.user.tokens.filter((token)=>{
            return token.token !==req.token
        })
        await req.user.save()
        res.send()
    }catch(error){
        res.status(500).send(error)
    }
})

router.post('/api/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens= []
        await req.user.save()
        res.send()
    }catch(error){
        res.status(500).send(error)
    }
})


router.patch('/api/users/me', auth,async (req,res)=>{
     const updates=Object.keys(req.body)
     const allowedUpdate=['name','password','age','email']
     const isValidOperation=updates.every((update)=> allowedUpdate.includes(update))
    if(!isValidOperation){
        return res.status(400).send( { error: "Invalide Update" })
    }
    try{
        updates.forEach((update) => req.user[update]=req.body[update])
        await req.user.save()     
        res.send(req.user)
    }catch(err){
        res.status(400).send(err)
    }
})

router.get('/api/users/me',auth, async (req,res)=>{
    res.send(req.user)
})

router.delete('/api/users/me',auth, async (req,res)=>{
   try{
       await req.user.deleteOne()
       res.send(req.user)
   }catch(err){
       res.status(500).send(err)
   }
})

module.exports=router