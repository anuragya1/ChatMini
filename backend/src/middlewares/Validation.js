import Joi from  'joi';

export const validateRegister = (req,res,next) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),

        email: Joi.string().email({
            tlds: { allow: false }
        }).required(),

        password: Joi.string().min(8).required()
    });
     
    const { error } = schema.validate(req.body);
    if(error){
        return res.status(400).json({
            error: error.details[0].message.replace(/["'"]/g,'')
        });
    }
    next();
}
// For Login we only need username and password 
export const validateLogin = (req,res,next)=>{
   const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).required()
   });

   const { error } = schema.validate(req.body);
   if(error){
    return res.status(400).json({
        error: error.details[0].message
    });
   }
   next();
}