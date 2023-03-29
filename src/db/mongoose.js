const mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected!'))
    .catch((error)=>{
    console.log(error)
    }
);





