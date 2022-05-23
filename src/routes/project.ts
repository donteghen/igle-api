import express, {Request, Response} from 'express'
import { userAuth, adminAuth } from '../middleware/authentication'
import { SAVE_OPERATION_FAILED, DELETE_OPERATION_FAILED, NOT_FOUND } from '../utils/errors'
import { DELETED_SUCCESSFULLY} from '../utils/successes'
import { mailer } from '../helpers/mailer';
import { IError } from '../models/interfaces';
import { Project } from '../models/project';
import { ProjectReport } from '../models/report';
import { ProjectRequest } from '../models/request';

const ProjectRouter = express.Router()

// create new project
ProjectRouter.post('/api/projects', userAuth, async (req:Request, res:Response) => {

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
ProjectRouter.get('/api/user/profile/projects', userAuth, async(req: Request, res: Response) => {
    try {
        const projects = await Project.find({owner:req.userId});
        res.send({ok:true, data:projects})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Get a single project created by the curent user
ProjectRouter.get('/api/user/profile/projects/:id', userAuth, async(req: Request, res: Response) => {
    try {
        const project = await Project.findOne({_id:req.params.id, owner:req.userId});
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
ProjectRouter.delete('/api/projects/:id', userAuth, async(req: Request, res: Response) => {
    try {
        const deletedProject = await Project.findOneAndDelete({id:req.params.id, owner: req.userId});
        if (!deletedProject) {
            let error = new Error();
            error = DELETE_OPERATION_FAILED
            throw error
        }
        // delete project's reports
        await ProjectReport.deleteMany({project:deletedProject.id})
        // delete project's  requests
        await ProjectRequest.deleteMany({project:deletedProject.id})

        res.send({ok:true, data:DELETED_SUCCESSFULLY})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Update project user
ProjectRouter.patch('/api/user/profile/projects/:id/update', userAuth, async(req: Request, res: Response) => {
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
ProjectRouter.patch('/api/user/profile/projects/:id/upgrade-plan', userAuth, async(req: Request, res: Response) => {
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
        const {email } = req.query
        let projects = await Project.find().populate('owner').exec()
        if (email) {
            projects = projects.filter(proj => proj.owner.email === email)
        }

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
        project.plan = req.body.plan ? req.body.plan : project.plan
        const updatedProject = await project.save()

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

        res.send({ok:true, data:updatedProject})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

export {ProjectRouter}