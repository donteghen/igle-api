import sgMail from '@sendgrid/mail'

export interface MailResponse {
    ok:boolean,
    error: string,
    message: string
}

const mailer = (toEmail: string, subject: string, heading: string, detail: string, link?: string) => {
    let mailresponse: MailResponse
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
    to: `${toEmail}`, // Change to your recipient
    from: 'donaldteghen@gmail.com', // Change to your verified sender
    subject: `${subject}`,
    text: 'and easy to do anywhere, even with Node.js',
    html: `
    <div style="padding:50px 0; background:#f9f9f9; text-align:center; margin:10px">
						<h1>Image Logo</h1>
                        <h4 style="text-decoration:underline; ">
                            <a href="www.autobazar.com.ca">autobazar.com.ca</a>
                        </h4>
                        <p>${heading}</p>
                        <h3 style="width:100%;">
                            <a style="padding:8px 10px; background:blue;
                            color: white; text-decoration:none; border-radius:4px;
                            border:none" href=${link}>${detail}
                            </a>
                        </h3>
                    </div>`,
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