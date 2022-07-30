import express, {Request, Response} from 'express'
import { userAuth, adminAuth, userVerified } from '../middleware/authentication'
import { SAVE_OPERATION_FAILED, NOT_FOUND, DELETE_OPERATION_FAILED } from '../utils/errors'
import { mailer } from '../helpers/mailer';
import { IError } from '../models/interfaces';
import { Testimonial } from '../models/testimonial';
import { notifyNewtestimonialAdded } from '../utils/constants/email-template';

const TestimonialRouter = express.Router()

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

// filter query function
function filterSetter (key:string, value:any) {

    let formattedValue: number | string | boolean
    switch (key) {
        case 'author':
            formattedValue = String(value)
            return {author : formattedValue}
        case 'min-rating':
            formattedValue = Number.parseInt(value, 10)
            return {rating: {$gte: formattedValue}}
        case 'max-rating':
            formattedValue = Number.parseInt(value, 10)
            return {rating: {$lte: formattedValue}}
        case 'show':
            formattedValue = toBoolean(value)
            return {show: formattedValue}
        default:
            return {}
    }
}
// Create a new testimonial
TestimonialRouter.post('/api/testimonials', userAuth, userVerified,  async (req:Request, res:Response) => {
    try {
        const author = req.userId
        const hasTestimonial = await Testimonial.findOne({author})
        if (hasTestimonial) {
            let error: IError = new Error()
            error = {
                name:'ALLREADY_HAS_TESTIMONIAL',
                message: 'You already submitted a testimonial! For any changes please contact support'
            }
            throw error
        }
        const newTestimonail = new Testimonial({
            author ,
            rating: Number.parseInt(req.body.rating, 10) ,
            comment: req.body.comment
        })
        const testimonial = await newTestimonail.save()
        if (!testimonial) {
            let error: IError = new Error()
            error = SAVE_OPERATION_FAILED
            throw error
        }

        // Notify the admin of the new testimonial
        const {subject, heading, detail, linkText} = notifyNewtestimonialAdded()
        const link = `${process.env.CLIENT_URL}/dashboard`
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


///////////////////////////////////////////////////////////////////////////////////


// Get all testimonials by admin
TestimonialRouter.get('/api/testimonials', async(req: Request, res: Response) => {
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
        const testimonials = await Testimonial.find(filter).populate('author').exec();
        res.send({ok:true, data:testimonials})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// // Get single testimonial
TestimonialRouter.get('/api/testimonials/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id).populate('author').exec();
        if (!testimonial) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        res.send({ok:true, data:testimonial})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Update testimonial show property
TestimonialRouter.patch('/api/testimonials/:id/show', userAuth, adminAuth, async (req:Request, res:Response) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id).populate('author').exec()
        if (!testimonial) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        testimonial.show = !testimonial.show
        const updatedTestimonial = await testimonial.save()

        res.status(200).send({ok:true, data: updatedTestimonial})
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

// Delete a testimonial
TestimonialRouter.delete('/api/testimonials/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const deletedTesimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!deletedTesimonial) {
            let error: IError = new Error()
            error = DELETE_OPERATION_FAILED
            throw error
        }
        res.send({ok:true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})
export {TestimonialRouter}