import express, {Request, Response} from 'express'
import { userAuth, adminAuth } from '../middleware/authentication'
import { SAVE_OPERATION_FAILED, DELETE_OPERATION_FAILED, NOT_FOUND } from '../utils/errors'
import { DELETED_SUCCESSFULLY} from '../utils/successes'
import { mailer } from '../helpers/mailer';
import { IError } from '../models/interfaces';
import { Contact } from '../models/contact';
import { notifyNewContactMessage } from '../utils/constants/email-template';

const ContactRouter = express.Router()

function filterSetter (key:string, value:any) {
    switch (key) {
        case 'replied':
            return {replied : value}
        case 'email':
            return {email : value}
        case 'name':
            return {name : value}
        default:
            return {}
    }
}

// Create a new contact message
ContactRouter.post('/api/contacts', async (req:Request, res:Response) => {
    try {
        const {name, email, subject, message, phone_number} = req.body
        const newContact = new Contact({
            name,
            email,
            subject,
            message,
            phone_number
        })
        const contact = await newContact.save()
        if (!contact) {
            let error: IError = new Error()
            error = SAVE_OPERATION_FAILED
            throw error
        }
        // Notify admin of new contact message
        const link = `${process.env.CLIENT_URL}`
        const adminEmail = process.env.ADMIN_EMAIL
        const _success = await mailer(adminEmail, notifyNewContactMessage.subject,
            notifyNewContactMessage.heading,notifyNewContactMessage.detail, link,
            notifyNewContactMessage.linkText )

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

////////////////////////////////////////////////////////////////////////////////////

// Get all contact messages by admin
ContactRouter.get('/api/contacts', userAuth, adminAuth, async (req:Request, res:Response) => {
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
        const contacts = await Contact.find(filter);
        res.send({ok:true, data:contacts})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Get a single contact message by admin
ContactRouter.get('/api/contacts/:id', userAuth, adminAuth, async (req:Request, res:Response) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            let error : IError = new Error()
            error = NOT_FOUND
            throw error
        }
        res.send({ok:true, data:contact})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Make a contact message as seen
ContactRouter.patch('/api/contacts/:id/replied', userAuth, adminAuth, async (req:Request, res:Response) => {
    try {
        const contact = await Contact.findById(req.params.id)
        if (!contact) {
            let error : IError = new Error()
            error = NOT_FOUND
            throw error
        }
        contact.replied = true
        const updateContact = await contact.save()
        res.send({ok: true, data: updateContact})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Delete Contact Message
ContactRouter.delete('/api/contacts/:id', userAuth, adminAuth, async (req:Request, res:Response) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(req.params.id)
        if (!deletedContact) {
            let error : IError = new Error()
            error = DELETE_OPERATION_FAILED
            throw error
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})
export {ContactRouter}