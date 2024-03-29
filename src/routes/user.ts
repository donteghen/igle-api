import express, {Request, Response} from 'express'
import { v4 as uuidv4, validate as uuidv4Validate }   from 'uuid';
import { User } from '../models/user'
import { userAuth, adminAuth, userVerified } from '../middleware/authentication'
import { TOKEN_GENERATION_FAILED, RESET_TOKEN_DEACTIVED,SAVE_OPERATION_FAILED, DELETE_OPERATION_FAILED, NO_USER, WRONG_RESET_TOKEN_TYPE, INVALID_RESET_TOKEN, EMAIL_ALREADY_EXITS, NEW_PASSWORD_IS_INVALID, OLD_PASSWORD_IS_INCORRECT} from '../utils/errors'
import { DELETED_SUCCESSFULLY, PASSWORD_RESET_SUCCESSFUL } from '../utils/successes'
import { multerUpload } from '../helpers/multer';
import { cloudinary } from '../helpers/cloudinary';
import { Token } from '../models/token';
import { mailer } from '../helpers/mailer';
import { IError } from '../models/interfaces';
import { compare } from 'bcrypt';
import isStrongPassword from 'validator/lib/isStrongPassword'
import { Project } from '../models/project';
import { notifyAccountVerified, verifyAccountTemplate, welcomeTemplate, notifyAccountCreated } from '../utils/constants/email-template';
import { ProjectRequest } from '../models/request';
import { Testimonial } from '../models/testimonial';

const UserRouter = express.Router()

// get User profile
UserRouter.get('/api/user/profile', userAuth, async (req: Request, res: Response) => {
    try {

        const user = await User.findById(req.userId)
        res.send({ok:true, data: user})
    } catch (error) {
        console.log(error)
        res.send({ok:false, error:error?.message})
    }
})

// user registration router endpoint
UserRouter.post('/api/users/signup', async (req: Request, res: Response) => {
    try {
       const newUser = new User({
           name: req.body.name,
           email: req.body.email,
           password: req.body.password,
           phone_number:req.body.phone_number
       })
       const userExist = await User.find({email:newUser.email})
       if (userExist.length > 0) {
            let error: IError = new Error()
            error = EMAIL_ALREADY_EXITS
            throw error
       }
       const user = await newUser.save();
       if (!user) {
        let error: IError = new Error()
        error = SAVE_OPERATION_FAILED
        throw error
       }
       const generatedToken = await newUser.generateUserSession();
       // console.log(generatedToken)
       if (!generatedToken) {
           let error: IError = new Error()
           error = TOKEN_GENERATION_FAILED
           throw error
       }
       // Send an account verification email to new user
       const link = `${process.env.CLIENT_URL}/account-verification?userId=${user.id}`
       const success = await mailer(user.email, verifyAccountTemplate.subject, verifyAccountTemplate.heading,
           verifyAccountTemplate.detail, link, verifyAccountTemplate.linkText )

       // Send a notifucation email to the admin
       const _link = `${process.env.CLIENT_URL}`
       const adminEmail = process.env.ADMIN_EMAIL
       const _success = await mailer(adminEmail, notifyAccountCreated.subject, notifyAccountCreated.heading,
            notifyAccountCreated.detail, link, notifyAccountCreated.linkText )

       res.status(201).send({ok:true, data:{user, generatedToken}})
    } catch (error) {
        if (error.name === 'ValidationError') {
            const VALIDATION_ERROR: IError = {
                name: 'VALIDATION_ERROR',
                message: error.message
            }
            res.status(400).send({ok: false, error:VALIDATION_ERROR})
            return
        }
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Verify newly created account
UserRouter.patch('/api/users/:id/verify', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            let error = new Error()
            error = NO_USER
            throw error
        }
        user.isVerified = true
       const updatedUser = await user.save()
        if (!updatedUser) {
            let error: IError = new Error()
            error = SAVE_OPERATION_FAILED
            throw error
        }
        // Send a welcome email to the verified user
        const link = `${process.env.CLIENT_URL}`
        const success = await mailer(updatedUser.email, welcomeTemplate.subject, welcomeTemplate.heading,
            welcomeTemplate.detail, link, welcomeTemplate.linkText )

        // Send a notification email to the admin

        const _link = `${process.env.CLIENT_URL}`
        const adminEmail = process.env.ADMIN_EMAIL
        const _success = await mailer(adminEmail, notifyAccountVerified.subject, notifyAccountVerified.heading,
             notifyAccountVerified.detail, _link, notifyAccountVerified.linkText )

        res.send({ok:true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// User avatar upload
UserRouter.post('/api/user/profile/avatar', userAuth, userVerified, multerUpload.single('avatar'), async (req: Request, res: Response) => {
    try {

        const user = await User.findById(req.userId)
        if(user.avatar){
            await cloudinary.v2.uploader.destroy(user.avatarDeleteId)
        }
        const result = await cloudinary.v2.uploader.upload(req.file.path,
            { folder: "Igle/Users/Avatars/",
               public_id: req.file.originalname
            }
        );
        user.avatar = result.secure_url
        user.avatarDeleteId = result.public_id
        const updatedUser = await user.save()

        res.send({ok:true, data:updatedUser})
    } catch (error) {
        console.log(error)
        res.status(400).send({ok:false, error:error?.message})
    }
})

// User update endpoint
UserRouter.patch('/api/user/profile/update', userAuth, userVerified, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            let error = new Error()
            error = NO_USER
            throw error
        }
        const {name, email, bio, phone_number, address} = req.body
        user.name = name ? name : user.name
        user.email = email ? email : user.email
        user.bio = bio ? bio : user.bio
        user.phone_number = phone_number ? phone_number : user.phone_number,
        user.address = address ? address : user.address


        const updatedUser = await user.save()
        if (!updatedUser) {
            let error: IError = new Error()
            error = SAVE_OPERATION_FAILED
            throw error
        }
        res.send({ok:true, data:updatedUser})
    } catch (error) {
        if (error.name === 'ValidationError') {
            const VALIDATION_ERROR: IError = {
                name: 'VALIDATION_ERROR',
                message: error.message
            }
            res.status(400).send({ok:false, error:VALIDATION_ERROR})
            return
        }
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Change user password
UserRouter.post('/api/user/profile/change-password', userAuth, userVerified, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            let error = new Error()
            error = NO_USER
            throw error
        }
        const {newPassword, oldPassword} = req.body
        const isMatched = await compare(oldPassword, user.password);

        if (!isMatched){
            let error: IError = new Error()
            error = OLD_PASSWORD_IS_INCORRECT
            throw error
        }
        if (!isStrongPassword(newPassword, {minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})) {
            let error: IError = new Error()
            error = NEW_PASSWORD_IS_INVALID
            throw error
        }
        user.password = newPassword
        const updatedUser = await user.save()
        res.send({ok:true, data: updatedUser})
    } catch (error) {
        console.log(error)
        res.status(400).send({ok:false, error:error?.message})
    }
})

// reset password endpoint
UserRouter.post('/api/users/reset-password',  async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({email:req.body.email})
    if (!user) {
        let error: IError = new Error()
        error = SAVE_OPERATION_FAILED
        throw error
    }
    const generatedToken = new Token({
        owner: user.id,
        secret: uuidv4(),
        createdAt: Date.now()
    })
    const newToken = await generatedToken.save()
    const link = `${process.env.CLIENT_URL}/confirm-reset-password?user=${user.email}&token=${newToken.secret}&createdAt=${newToken.createdAt}`
    const success = mailer(user.email, 'User Password Reset', 'You have requested to reset your password', 'A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions. <strong>This operation has an active life cycle 1 hour!</strong>', link, 'click to continue', )

    res.send({ok:true})
    } catch (error) {
        console.log(error)
        res.status(400).send({ok:false, error:error?.message})
    }

})

UserRouter.post('/api/users/confirm-reset-password/', async (req: Request, res: Response) => {
    try {
        const {email, password, token} = req.body
        if (!uuidv4Validate(token)) {
            let error: IError = new Error()
            error = WRONG_RESET_TOKEN_TYPE
            throw error
        }
        const user = await User.findOne({email})
        if (!user) {
            let error: IError = new Error()
            error = NO_USER
            throw error
        }

        const resetToken = await Token.findOne({owner:user._id, secret:token})

        if (!resetToken) {
            let error: IError = new Error()
            error = INVALID_RESET_TOKEN
            throw error
        }

        if (Date.now() - resetToken.createdAt > 3600000){
            let error: IError = new Error()
            error = RESET_TOKEN_DEACTIVED
            throw error
        }

        user.password = password
        await user.save()
        await Token.deleteMany({owner:user.id})
        res.send({ok:true, data: PASSWORD_RESET_SUCCESSFUL})
    } catch (error) {
        console.log(error)
        res.status(400).send({ok:false, error:error?.message})
    }
})

// update project plan by user
// UserRouter.patch('/api/projects/:id/user-update-project-plan', userAuth, async (req:Request, res:Response) => {
//     try {

//         const project = await Project.findOne({id: req.params.id, owner: req.userId})
//         if (!project) {
//             let error:IError = new Error()
//             error = NOT_FOUND
//             throw error
//         }
//         project.plan = req.body.plan
//         await project.save()
//         res.send({ok:true})
//     } catch (error) {
//         console.log(error)
//         res.status(400).send({ok:false, error:error?.message})
//     }
// })

// User login endpoint
UserRouter.post('/api/users/login', async (req:Request, res: Response) => {
    try {
        const user = await User.getUserWithCredentials(req.body.email, req.body.password)
        const newSessionToken = await user.generateUserSession()

        res.send({ok: true, data:{token: newSessionToken, user}})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// User Logout endpoint
UserRouter.post('/api/user/profile/logout', userAuth, async (req:Request, res:Response) => {
    try {
        const user = await User.findById(req.userId)
        user.tokens = [];
        await user.save()
        res.send({ok:true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})


/********************************* Admin Restricted ******************************************** */

// get all users is admin restricted router endpoint
UserRouter.get('/api/users', userAuth, adminAuth, async (req: Request, res: Response) => {
    try {
        const users = await User.find()
        res.send({ok:true, data:users})
    } catch (error) {
        res.send({ok:false, error:error?.message})
    }
})


// get a single user by id admin
UserRouter.get('/api/users/:id', userAuth, adminAuth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            let error = new Error()
            error = NO_USER
            throw error
        }
        res.send({ok:true, data:user})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})


// User deletion by admin
UserRouter.delete('/api/users/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            let error = new Error();
            error = DELETE_OPERATION_FAILED
            throw error
        }
        if (deletedUser.avatar && deletedUser.avatarDeleteId) {
            await cloudinary.v2.uploader.destroy(deletedUser.avatarDeleteId)
        }
        await Project.deleteMany({owner:deletedUser.id})
        await ProjectRequest.deleteMany({sender:deletedUser.id})
        await Testimonial.deleteMany({author:deletedUser.id})
        res.send({ok:true, data:DELETED_SUCCESSFULLY})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})
export {UserRouter}