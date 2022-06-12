import express, {Request, Response} from 'express'
import { userAuth, adminAuth, userVerified } from '../middleware/authentication'
import { SAVE_OPERATION_FAILED, DELETE_OPERATION_FAILED, NOT_FOUND } from '../utils/errors'
import { DELETED_SUCCESSFULLY} from '../utils/successes'
import { mailer } from '../helpers/mailer';
import { IError } from '../models/interfaces';
import { Project } from '../models/project';
import { ProjectReport } from '../models/report';
import {User} from '../models/user'
import { ProjectRequest } from '../models/request';
import { notifyProjectActivated, notifyProjectCreated, notifyProjectDeleted, notifyProjectPlanUpgraded,
    notifyProjectStatusChange, notifyProjectDeactivated } from '../utils/constants/email-template';

const ProjectRouter = express.Router()

function filterSetter (key:string, value:any) {
    switch (key) {
        case 'owner':
            return {'owner': value}
        case 'plan':
            return {'plan': value}
        case 'name':
            return {name: { "$regex": value, $options: 'i'}}
        case 'status':
            return {status: value}
        case 'active':
            return {active: value}
        default:
            return {}
    }
}
// create new project
ProjectRouter.post('/api/projects', userAuth, userVerified, async (req:Request, res:Response) => {

    try {
        const {name, plan, detail, description} = req.body
        const owner = req.userId
        const newProject = new Project({
            name,
            owner,
            plan,
            detail,
            description
        })
        const project = await newProject.save();
        if (!project) {
         let error: IError = new Error()
         error = SAVE_OPERATION_FAILED
         throw error
        }

        // Send a notifucation email to the admin
        const link = `${process.env.CLIENT_URL}`
        const adminEmail = process.env.ADMIN_EMAIL
        const _success = await mailer(adminEmail, notifyProjectCreated.subject, notifyProjectCreated.heading,
             notifyProjectCreated.detail, link, notifyProjectCreated.linkText )

        res.status(201).send({ok:true, data:project})
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

// Get all projects created by the curent user
ProjectRouter.get('/api/user/profile/projects', userAuth, userVerified,  async(req: Request, res: Response) => {
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
        filter = {owner:req.userId, ...filter}
        const projects = await Project.find(filter).populate('owner').exec();
        res.send({ok:true, data:projects})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Get a single project created by the curent user
ProjectRouter.get('/api/user/profile/projects/:id', userAuth, userVerified,  async(req: Request, res: Response) => {
    try {
        const project = await Project.findOne({_id:req.params.id, owner:req.userId}).populate('owner').exec();
        if (!project) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }

        res.send({ok:true, data:project})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})


// delete project by user
ProjectRouter.delete('/api/projects/:id', userAuth, userVerified, async(req: Request, res: Response) => {
    try {
        const deletedProject = await Project.findOneAndDelete({id:req.params.id, owner: req.userId});
        if (!deletedProject) {
            let error = new Error();
            error = DELETE_OPERATION_FAILED
            throw error
        }
        const user = await User.findById(req.userId)
        // delete project's reports
        await ProjectReport.deleteMany({project:deletedProject.id})
        // delete project's  requests
        await ProjectRequest.deleteMany({project:deletedProject.id})

        // Notify admin via email of the deletion operation so that cloud resources can be freed
        const {subject, heading, linkText, detail} = notifyProjectDeleted(user?.email, deletedProject.name, deletedProject.id)
        const _link = `${process.env.CLIENT_URL}`
        const adminEmail = process.env.ADMIN_EMAIL
        const _success = await mailer(adminEmail, subject, heading, detail, _link, linkText )

        res.send({ok:true, data:DELETED_SUCCESSFULLY})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Update project user
ProjectRouter.patch('/api/user/profile/projects/:id/update', userAuth, userVerified,  async(req: Request, res: Response) => {
    try {
        const project = await Project.findOne({_id:req.params.id, owner:req.userId})
        if (!project) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }

        const {name, detail, description} = req.body
        project.name = name ? name : project.name
        project.detail = detail ? detail : project.detail
        project.description = description ? description : project.description

        const updatedProject = await project.save()

        res.send({ok:true, data:updatedProject})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// upgrade plan for a project by user
ProjectRouter.patch('/api/user/profile/projects/:id/upgrade-plan', userAuth, userVerified,  async(req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id)
        if (!project) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        project.plan = req.body.plan ? req.body.plan : project.plan
        const updatedProject = await project.save()

        res.send({ok:true, data:updatedProject})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

//////////////////////////////////////////////////////////////////////////////////////



// Get all projects by Admin
ProjectRouter.get('/api/projects', userAuth, adminAuth, async(req: Request, res: Response) => {
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
        const projects = await Project.find(filter).populate('owner').exec()
        res.send({ok:true, data:projects})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Get a single projects by Admin
ProjectRouter.get('/api/projects/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner').exec()
        if (!project) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        res.send({ok:true, data:project})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// upgrade plan for a project by Admin
ProjectRouter.patch('/api/projects/:id/upgrade-plan', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id)
        if (!project) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        const user = await User.findById(project.owner)

        project.plan = req.body.plan ? req.body.plan : project.plan
        const updatedProject = await project.save()

        // Notify project on project plan updated
        const {subject, heading, linkText, detail} = notifyProjectPlanUpgraded(user?.name, updatedProject.name, updatedProject.id, updatedProject.plan)
        const _link = `${process.env.CLIENT_URL}`
        const _success = await mailer(user.email, subject, heading, detail, _link, linkText )

        res.send({ok:true, data:updatedProject})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// change status for a project by Admin
ProjectRouter.patch('/api/projects/:id/status-change', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id)
        if (!project) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        project.status = req.body.status ? req.body.status : project.status
        const updatedProject = await project.save()

        const user = await User.findById(project.owner)

        // Notify project on project status change
        const {subject, heading, linkText, detail} = notifyProjectStatusChange(user?.name, updatedProject.name, updatedProject.id, updatedProject.status)
        const _link = `${process.env.CLIENT_URL}`
        const _success = await mailer(user.email, subject, heading, detail, _link, linkText )

        res.send({ok:true, data:updatedProject})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})


// activate project after receieving payments project by Admin
ProjectRouter.patch('/api/projects/:id/activate', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id)
        if (!project) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        project.active = true
        const updatedProject = await project.save()


        // Notify project owner when project is activated
        const user = await User.findById(project.owner)
        const {subject, heading, linkText, detail} = notifyProjectActivated(user?.name, updatedProject.name, updatedProject.id)
        const _link = `${process.env.CLIENT_URL}/login`
        const _success = await mailer(user.email, subject, heading, detail, _link, linkText )

        res.send({ok:true, data:updatedProject})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// de-activate project if payment is not made project by Admin
ProjectRouter.patch('/api/projects/:id/deactivate', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id)
        if (!project) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        project.active = false
        const updatedProject = await project.save()

        // Notify project owner when project is deactivated
        const user = await User.findById(project.owner)
        const {subject, heading, linkText, detail} = notifyProjectDeactivated(user?.name, updatedProject.name, updatedProject.id)
        const _link = `${process.env.CLIENT_URL}/contact`
        const _success = await mailer(user.email, subject, heading, detail, _link, linkText )

        res.send({ok:true, data:updatedProject})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

export {ProjectRouter}