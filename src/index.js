const express=require('express');
const cors=require('cors')
require('./db/mongoose');
const userRouter=require('./routers/user');
const taskRouter=require('./routers/task');

const app=express();
app.use(cors())
const port=process.env.PORT
app.use(express.json())

app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=>{
    console.log("server is listing at port ",port)
})