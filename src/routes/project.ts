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
         res.status(400).send({ok:false, error})
     }
})


// delete project by user
ProjectRouter.delete('/api/projects/:id', async(req: Request, res: Response) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);
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
        res.status(400).send({ok:false, error})
    }
})

//////////////////////////////////////////////////////////////////////////////////////

// Get all projects by Admin
ProjectRouter.get('/api/projects', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const projects = await Project.find();
        res.send({ok:true, data:projects})
    } catch (error) {
        res.status(400).send({ok:false, error})
    }
})

export {ProjectRouter}