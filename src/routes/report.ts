import express, {Request, Response} from 'express'
import { userAuth, adminAuth, userVerified } from '../middleware/authentication'
import { SAVE_OPERATION_FAILED, NOT_FOUND, DELETE_OPERATION_FAILED } from '../utils/errors'
import { mailer } from '../helpers/mailer';
import { IError } from '../models/interfaces';
import { Project } from '../models/project';
import { ProjectReport } from '../models/report';
import { notifyReportDisptached } from '../utils/constants/email-template';
const ReportRouter = express.Router()

function filterSetter (key:string, value:any) {
    switch (key) {
        case 'file_type':
            return {'file.file_type': value}
        case 'project':
            return {project: value}
        case 'alert_dispatch':
            return {alert_dispatch: value}
        default:
            return {}
    }
}


// Get all a project's Reports by project owner(user)
ReportRouter.get('/api/user/profile/projects/:id/reports', userAuth, userVerified,  async(req: Request, res: Response) => {
    try {
        const activeProject = await Project.findOne({_id: req.params.id, owner:req.userId})
        if (!activeProject) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        const projectReports = await ProjectReport.find({project: activeProject._id});
        res.send({ok:true, data:projectReports})
    } catch (error) {
        res.status(400).send({ok:false, error})
    }
})
// Get a single project Report by project owner(user)
ReportRouter.get('/api/user/profile/projects/:projectId/reports/:reportId', userAuth, userVerified,  async(req: Request, res: Response) => {
    try {
        const {projectId, reportId} = req.params
        const activeProject = await Project.findOne({_id: projectId, owner:req.userId})
        if (!activeProject) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        const projectReport = await ProjectReport.findOne({_id: reportId, project: activeProject._id});
        res.send({ok:true, data:projectReport})
    } catch (error) {
        res.status(400).send({ok:false, error})
    }
})

//////////////////////////////////////////////////////////////////////////////////

// Create a new project report
ReportRouter.post('/api/projects/:id/reports', userAuth, adminAuth, async (req:Request, res:Response) => {
    try {
        const {file_type, file_content, overview } = req.body

        // making sure the project belongs to the user making the request
        const activeProject = await Project.findById(req.params.id).populate('owner').exec()
        if (!activeProject) {
            throw new Error('Error')
        }
        if (!activeProject.active) {
            throw new Error('This project is inactive. Please contact the support team if you believe there is an issue with your payments!. Thanks and Sorry for the inconvinience')
        }
        const newReport = new ProjectReport({
            date: Date.now() ,
            file:{
                file_type,
                file_content
            },
            project: req.params.id ,
            overview
        })
        const projectReport = await newReport.save()
        if (!projectReport) {
            let error: IError = new Error()
            error = SAVE_OPERATION_FAILED
            throw error
           }
        res.status(201).send({ok: true, data: projectReport})
    } catch (error) {
        if (error.name === 'ValidationError') {
            const VALIDATION_ERROR: IError = {
                name: 'VALIDATION_ERROR',
                message: error.message
            }
            res.status(400).send({ok: false, error:VALIDATION_ERROR})
            return
        }
        res.status(400).send({ok:false, error:error.message})
    }
})

// Dispatch a notifcation about new report upload
ReportRouter.post('/api/reports/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const report = await ProjectReport.findById(req.params.id).populate({path:'project', populate:{path:'owner'}})
        if (!report) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        report.alert_dispatch = true
        const updatedReport = await report.save()
        // notify the project owner when a new report is uploaded
        const {owner, name, id} = report.project
        const {subject, heading, detail, linkText} = notifyReportDisptached(owner.name, name, id)
        const link = process.env.CLIENT_URL + '/dashboard'
        const success = await mailer(owner.email, subject, heading, detail, link, linkText )

        res.send({ok:true})
    } catch (error) {
        console.log(error)
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Get all Report
ReportRouter.get('/api/reports', userAuth, adminAuth, async(req: Request, res: Response) => {
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
        const projectReports = await ProjectReport.find(filter).populate({path:'project', populate:{path:'owner'}}).exec();
        res.send({ok:true, data:projectReports})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})


// Get all a project's Reports
ReportRouter.get('/api/projects/:id/reports', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const projectReports = await ProjectReport.find({project:req.params.id});
        res.send({ok:true, data:projectReports})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})


// Get a report preview
ReportRouter.get('/api/reports/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const report = await ProjectReport.findById(req.params.id).populate('project').exec()
        if (!report) {
            let error: IError = new Error()
            error = NOT_FOUND
            throw error
        }
        res.send({ok:true, data:report})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})

// Delete a report
ReportRouter.delete('/api/reports/:id', userAuth, adminAuth, async(req: Request, res: Response) => {
    try {
        const deletedReport = await ProjectReport.findByIdAndDelete(req.params.id)
        if (!deletedReport) {
            let error: IError = new Error()
            error = DELETE_OPERATION_FAILED
            throw error
        }
        res.send({ok: true})
    } catch (error) {
        res.status(400).send({ok:false, error:error?.message})
    }
})
export {ReportRouter}