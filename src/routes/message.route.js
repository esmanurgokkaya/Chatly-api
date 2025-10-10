import express from 'express';

const router = express.Router();

router.get('/send', (req,res) =>{
    res.send('messages route');
});



export default router;