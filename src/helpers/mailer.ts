import sgMail from '@sendgrid/mail'
import {mailerHtml} from '../utils/mailer-html'
export interface MailResponse {
    ok:boolean,
    error: string,
    message: string
}



const mailer = (toEmail: string, subject: string, heading: string, detail: string, link?: string, linkText?:string) => {
    let mailresponse: MailResponse
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
    to: `${toEmail}`, // Change to your recipient
    from: 'donaldteghen@gmail.com', // Change to your verified sender
    subject: `${subject}`,
    text: `${heading} /n ${detail}`,
    html: mailerHtml(heading, detail, link, linkText),
    }
    sgMail.send(msg).then(() => {
        mailresponse = {
            ok:true,
            error: '',
            message: 'Successfuly send!'
        }
    })
    .catch((error:any) => {
        mailresponse = {
            ok:true,
            error: error.response.body,
            message: ''
        }
    })
    return mailresponse
}
export {mailer}