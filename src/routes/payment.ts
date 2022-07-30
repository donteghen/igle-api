import { Payment } from "../models/payment";
import express, {Request, Response} from 'express'
import { userAuth, adminAuth, userVerified } from '../middleware/authentication'
import { SAVE_OPERATION_FAILED, NOT_FOUND, DELETE_OPERATION_FAILED } from '../utils/errors'
import { mailer } from '../helpers/mailer';
import { IError } from '../models/interfaces';
import { confirmPaymentReceived, confirmPaymentRefund } from '../utils/constants/email-template';
import { Project } from "../models/project";
import { User } from "../models/user";



const PaymentRouter = express.Router()

// casting a string to boolean
function toBoolean (stringValue: string) : boolean | undefined {
    if (stringValue === 'true') {
        return true
    }
    else if (stringValue === 'false') {
        return false
    }
    else {
        return undefined
    }
}

// query filter function
function filterSetter (key:string, value:any) {

    let formattedValue: number | string | boolean
    switch (key) {
        case 'sender':
            formattedValue = String(value)
            return {sender : formattedValue}
        case 'project':
            formattedValue = String(value)
            return {project : formattedValue}
        case 'method':
            formattedValue = String(value)
            return {method : formattedValue}
        case 'refunded':
            formattedValue = toBoolean(value)
            return {refunded: formattedValue}
        default:
            return {}
    }
}


/////////////////////////////// User Restricted //////////////////////////////////////////

// get all user's payment history
PaymentRouter.get('/api/user/profile/payments', userAuth, userVerified, async(req: Request, res: Response) => {
    try {

        const payments = await Payment.find({sender:req.userId}).populate('project').populate('sender').exec();

        res.send({ok:true, data:payments})

    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// get user's project payments
PaymentRouter.get('/api/user/profile/projects/:id/payments', userAuth, userVerified, async(req: Request, res: Response) => {
    try {
        const project = await Project.findOne({_id:req.params.id, owner:req.userId});
        if (!project) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        const payments = await Payment.find({project:project.id}).populate('project').populate('sender').exec()
        res.send({ok:true, data:payments})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// // Get single payment by user
PaymentRouter.get('/api/user/profile/payments/:id', userAuth, userVerified, async(req: Request, res: Response) => {
    try {

        const payment = await Payment.findOne({_id:req.params.id, sender:req.userId}).populate('project').populate('sender').exec();
        if (!payment) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }

        res.send({ok:true, data:payment})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

/////////////////////////////// Admin Restricted //////////////////////////////////////////

// post new payment by admin
PaymentRouter.post('/api/payments', userAuth, adminAuth, async (req: Request, res:Response) => {
    try {
        const {method, project, note, amount} = req.body

        // get the related project
        const linkedProject = await Project.findById(project).populate('owner').exec()
        if (!linkedProject) {
            let error
            error = NOT_FOUND
            throw error
        }
        // get the project owner
        const linkedSender = linkedProject?.owner
        if (!linkedSender) {
            let error
            error = NOT_FOUND
            throw error
        }

        const newPayment = new Payment({
            sender:linkedSender.id,
            method,
            project,
            note,
            amount
        })

        
        const payment = await newPayment.save()
        if (!payment) {
            let error: IError = new Error()
            error = SAVE_OPERATION_FAILED
            throw error
        }
        // Confirm payment recieved to user
        const {subject, heading, detail, linkText} = confirmPaymentReceived(linkedSender.name, linkedProject.name, linkedProject.plan)
        const link = `${process.env.CLIENT_URL}/profile`
        const adminEmail = process.env.ADMIN_EMAIL
        const _success = await mailer(adminEmail, subject, heading, detail, link, linkText)

        res.status(201).send({ok:true})
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

// Get all payments by admin
PaymentRouter.get('/api/payments', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        let filter: any = {}
        const queries = Object.keys(req.query)
        if (queries.length > 0) {
            queries.forEach(key => {
                if (req.query[key]) {
                    filter = Object.assign(filter, filterSetter(key, req.query[key]))
                }
            })
        }
        const payments = await Payment.find(filter).populate('project').populate('sender').exec();
        res.send({ok:true, data:payments})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// // Get single payment by admin
PaymentRouter.get('/api/payments/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('project').populate('sender').exec();
        if (!payment) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        res.send({ok:true, data:payment})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Update payment refund status by user
PaymentRouter.patch('/api/payments/:id/refunded', userAuth, adminAuth, async (req: Request, res:Response) => {
    try {

        const payment = await Payment.findById(req.params.id)
        if (!payment) {
            let error
            error = NOT_FOUND
            throw error
        }
        const linkedSender = await User.findById(payment.sender)
        if (!linkedSender) {
            let error
            error = NOT_FOUND
            throw error
        }
        const linkedProject = await Project.findById(payment.project)
        if (!linkedProject) {
            let error
            error = NOT_FOUND
            throw error
        }

        payment.refunded = true;
        const updatedPayment = await payment.save()


        // Confirm payment refunded to user
        const {subject, heading, detail, linkText} = confirmPaymentRefund(linkedSender.name, linkedProject.name, linkedProject.plan)
        const link = `${process.env.CLIENT_URL}/profile`
        const adminEmail = process.env.ADMIN_EMAIL
        const _success = await mailer(adminEmail, subject, heading, detail, link, linkText)

        res.status(200).send({ok:true})
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

// Delete a payment
PaymentRouter.delete('/api/payments/:id/', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
        if (!deletedPayment) {
            let error: IError = new Error()
            error = DELETE_OPERATION_FAILED
            throw error
        }
        res.send({ok:true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

export {PaymentRouter}