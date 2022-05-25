import express, {Request, Response} from 'express'
import { userAuth, adminAuth, userVerified } from '../middleware/authentication'
import { SAVE_OPERATION_FAILED, NOT_FOUND, DELETE_OPERATION_FAILED } from '../utils/errors'
import { mailer } from '../helpers/mailer';
import { IError } from '../models/interfaces';
import { Project } from '../models/project';
import { ProjectRequest } from '../models/request';
import { notifyNewProjectRequest, notifyProjectRequestStatusChanged } from '../utils/constants/email-template';

const RequestRouter = express.Router()

function filterSetter (key:string, value:any) {
    switch (key) {
        case 'sender':
            return {sender : value}
        case 'project':
            return {project: value}
        default:
            return {}
    }
}
// Create a new request
RequestRouter.post('/api/projects/:id/requests', userAuth, userVerified,  async (req:Request, res:Response) => {
    try {
        const sender = req.userId
        // making sure the project belongs to the user making the request
        const activeProject = await Project.findById(req.params.id).populate('owner').exec()
        if (!activeProject) {
            throw new Error('Error')
        }
        if (activeProject?.owner?.id !== sender.toString()) {
            throw new Error('Error')
        }
        if (!activeProject.active) {
            throw new Error('This project is inactive, please contact the support team')
        }

        const newRequest = new ProjectRequest({
            sender ,
            project: req.params.id ,
            request_type: req.body.request_type ,
            detail: req.body.detail
        })
        const projectRequest = await newRequest.save()
        if (!projectRequest) {
            let error: IError = new Error()
            error = SAVE_OPERATION_FAILED
            throw error
        }

        // Notify the admin of the new request
        const {owner, name, id} = activeProject
        const {subject, heading, detail, linkText} = notifyNewProjectRequest(owner.name, name, id)
        const link = `${process.env.CLIENT_URL}`
        const adminEmail = process.env.ADMIN_EMAIL
        const _success = await mailer(adminEmail, subject, heading, detail, link, linkText)

        res.status(201).send({ok:true, data:projectRequest})
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

// // Get all current project's requests by the curent user
RequestRouter.get('/api/user/profile/projects/:projectId/requests', userAuth, userVerified,  async(req: Request, res: Response) => {
    try {
        const {projectId} = req.params
        const requests = await ProjectRequest.find({project:projectId, sender:req.userId});
        res.send({ok:true, data:requests})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// // Get single request by the curent user for a project
RequestRouter.get('/api/user/profile/projects/:projectId/requests/:requestId', userAuth, userVerified,  async(req: Request, res: Response) => {
    try {
        const {projectId, requestId} = req.params
        const projectRequest = await ProjectRequest.findOne({id:requestId, project:projectId, sender:req.userId});
        if (!projectRequest) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        res.send({ok:true, data:projectRequest})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

///////////////////////////////////////////////////////////////////////////////////


// // Get all current project's requests by the curent user
RequestRouter.get('/api/requests', userAuth, adminAuth, async(req: Request, res: Response) => {
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
        const projectRequests = await ProjectRequest.find(filter);
        res.send({ok:true, data:projectRequests})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// // Get single request by the curent user for a project
RequestRouter.get('/api/requests/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const projectRequest = await ProjectRequest.findById(req.params.id);
        if (!projectRequest) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        res.send({ok:true, data:projectRequest})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Update request status
RequestRouter.patch('/api/requests/:id/update-status', userAuth, adminAuth, async (req:Request, res:Response) => {
    try {
        const projectRequest = await ProjectRequest.findById(req.params.id).populate({path:'project', populate:{path:'owner'}})
        if (!projectRequest) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        projectRequest.status = req.body.status ? req.body.status : projectRequest.status
        const updateRequest = await projectRequest.save()

        // Notify the project owner about the request status update
        const {owner, name, id} = projectRequest.project
        const {subject, heading, linkText, detail} = notifyProjectRequestStatusChanged(owner.name, name, id, updateRequest.status )
        const _link = `${process.env.CLIENT_URL}`
        const _success = await mailer(owner.email, subject, heading, detail, _link, linkText )

        res.status(200).send({ok:true, data:updateRequest})
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

// Delete a projects request by Id
RequestRouter.delete('/api/requests/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const deletedRequest = await ProjectRequest.findByIdAndDelete(req.params.id);
        if (!deletedRequest) {
            let error: IError = new Error()
            error = DELETE_OPERATION_FAILED
            throw error
        }
        res.send({ok:true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})
export {RequestRouter}