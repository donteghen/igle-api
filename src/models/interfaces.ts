import { Document, PopulatedDoc} from "mongoose";

export interface IFile {
    file_type: string,
    file_content: string | [string]
}

export interface ISuccessMessage {
    ok: boolean
    message: string
}

export interface IError extends Error{
    name: string,
    message: string
}

export interface UserDocument extends Document {
    name: string,
    email: string,
    password: string,
    avatarDeleteId?: string,
    avatar?: string,
    bio?:string,
    phone_number?: string,
    tokens: string[],
    isAdmin: boolean,
    isVerified:boolean
}

export interface ProjectDocument extends Document {
    name: string,
    owner: PopulatedDoc<UserDocument & Document>,
    status: string,
    plan: string,
    detail: string,
    description:string,
    active: boolean
}


export interface ReportDocument extends Document {
    project: PopulatedDoc<ProjectDocument & Document>,
    file: IFile,
    overview: string,
    alert_dispatch: boolean,
    date:number
}

export interface RequestDocument extends Document {
    sender: PopulatedDoc<UserDocument & Document>,
    request_type: string,
    status:string,
    project: PopulatedDoc<ProjectDocument & Document>,
    detail: string
}
export interface ContactDocument extends Document {
    email:string,
    name:string,
    subject:string,
    createdAt:number,
    message:string,
    phone_number:string,
    replied:boolean
}


export interface TokenDocument extends Document {
    owner: string,
    secret: string,
    createdAt: number
}