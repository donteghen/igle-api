import express, {Request, Response} from 'express'
import { v4 as uuidv4, validate as uuidv4Validate }   from 'uuid';
import { User } from '../models/user'
import { userAuth, adminAuth } from '../middleware/authentication'
import { TOKEN_GENERATION_FAILED, RESET_TOKEN_DEACTIVED,SAVE_OPERATION_FAILED, DELETE_OPERATION_FAILED, NO_USER, WRONG_RESET_TOKEN_TYPE, INVALID_RESET_TOKEN, PASSWORD_INCORRECT, NEW_PASSWORD_IS_INVALID, OLD_PASSWORD_IS_INCORRECT, NOT_FOUND } from '../utils/errors'
import { DELETED_SUCCESSFULLY, PASSWORD_RESET_SUCCESSFUL } from '../utils/successes'
import { multerUpload } from '../helpers/multer';
import { cloudinary } from '../helpers/cloudinary';
import { Token } from '../models/token';
import { mailer } from '../helpers/mailer';
import { IError } from '../models/interfaces';
import { compare } from 'bcrypt';
import isStrongPassword from 'validator/lib/isStrongPassword'
import { Project } from '../models/project';

const UserRouter = express.Router()

// get User profile
UserRouter.get('/api/user/profile', userAuth, async (req: Request, res: Response) => {
    try {

        const user = await User.findById(req.userId)
        res.send({ok:true, data: user})
    } catch (error) {
        console.log(error)
        res.send({ok:false, error})
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
        res.status(400).send({ok:false, error})
    }
})

// User avatar upload
UserRouter.post('/api/user/profile/avatar', userAuth, multerUpload.single('avatar'), async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId)
        if(user.avatar){
            await cloudinary.v2.uploader.destroy(user.avatarDeleteId)
        }
        const result = await cloudinary.v2.uploader.upload(req.file.path,
            { folder: "Igle/Users/Avatars/",
               public_id: user._id
            }
        );
        user.avatar = result.secure_url
        user.avatarDeleteId = result.public_id
        const updatedUser = await user.save()
        res.send({ok:true, data:updatedUser})
    } catch (error) {
        res.status(400).send({ok:false, error})
    }
})

// User update endpoint
UserRouter.patch('/api/user/profile/update', userAuth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            let error = new Error()
            error = NO_USER
            throw error
        }
        const {name, email, bio, phone_number} = req.body
        user.name = name ? name : user.name
        user.email = email ? email : user.email
        user.bio = bio ? bio : user.bio
        user.phone_number = phone_number ? phone_number : user.phone_number

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
        res.status(400).send({ok:false, error})
    }
})

// Change user password
UserRouter.post('/api/user/profile/change-password', userAuth, async (req: Request, res: Response) => {
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
        await user.save()
        res.send({ok:true})
    } catch (error) {
        console.log(error)
        res.status(400).send({ok:false, error})
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
    const link = `${process.env.CLIENT_URL}/confirm-user-password?user=${user.email}&token=${newToken.secret}&createdAt=${newToken.createdAt}`
    const success = mailer(user.email, 'User Password Reset', 'You have requested to reset your password', 'A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions. <strong>This operation has an active life cycle 1 hour!</strong>', link, 'click to continue', )

    res.send({ok:true})
    } catch (error) {
        console.log(error)
        res.status(400).send({ok:false, error})
    }

})

UserRouter.post('/api/users/confirmresetpassword/', async (req: Request, res: Response) => {
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
        await Token.deleteMany({owner:user.id})
        if (Date.now() - resetToken.createdAt > 3600000){
            let error: IError = new Error()
            error = RESET_TOKEN_DEACTIVED
            throw error
        }

        user.password = password
        await user.save()
        res.send({ok:true, data: PASSWORD_RESET_SUCCESSFUL})
    } catch (error) {
        console.log(error)
        res.status(400).send({ok:false, error})
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
//         res.status(400).send({ok:false, error})
//     }
// })

// User login endpoint
UserRouter.post('/api/users/login', async (req:Request, res: Response) => {
    try {
        const user = await User.getUserWithCredentials(req.body.email, req.body.password)
        const newSessionToken = await user.generateUserSession()

        res.send({ok: true, data:{token: newSessionToken, user}})
    } catch (error) {
        // console.log(error)
        res.status(400).send({ok:false, error})
    }
})

// User Logout endpoint
UserRouter.post('/api/users/logout', userAuth, async (req:Request, res:Response) => {
    try {
        const user = await User.findById(req.userId)
        user.tokens = [];
        await user.save()
        res.send({ok:true})
    } catch (error) {
        res.status(400).send({ok:false, error})
    }
})


/********************************* Admin Restricted ******************************************** */

// get all users is admin restricted router endpoint
UserRouter.get('/api/users', userAuth, adminAuth, async (req: Request, res: Response) => {
    try {
        const users = await User.find()
        res.send({ok:true, data:users})
    } catch (error) {
        res.send({ok:false, error})
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
        res.status(400).send({ok:false, error})
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
        res.send({ok:true, data:DELETED_SUCCESSFULLY})
    } catch (error) {
        res.status(400).send({ok:false, error})
    }
})
export {UserRouter}