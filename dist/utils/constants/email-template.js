"use strict";
////////////////////////// ------User Related ------/////////////////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyNewtestimonialAdded = exports.notifyProjectRequestStatusChanged = exports.notifyNewProjectRequest = exports.notifyNewContactMessage = exports.notifyReportDisptached = exports.notifyProjectDeactivated = exports.notifyProjectActivated = exports.notifyProjectStatusChange = exports.notifyProjectPlanUpgraded = exports.notifyProjectDeleted = exports.notifyProjectCreated = exports.notifyAccountVerified = exports.welcomeTemplate = exports.notifyAccountCreated = exports.verifyAccountTemplate = void 0;
exports.verifyAccountTemplate = {
    subject: 'Account verification',
    heading: 'Account Verification',
    detail: 'Please follow the link below to verify your account in order to complete your registration procedure.<br><strong>Visit the link to verify your account</strong>',
    linkText: 'Verify'
};
exports.notifyAccountCreated = {
    subject: 'New Account Added',
    heading: 'A New User Joined the Platform',
    detail: 'A new user recently registered and the account is pending verification<br><strong>Visit the admin dashboard for follow-up</strong>',
    linkText: 'Go to Admin Dashboard'
};
exports.welcomeTemplate = {
    subject: 'Welcome to Igle',
    heading: 'Welcome to Igle, project owner\'s favorite tool',
    detail: 'Thanks for verifying your account. You account registration is now completely, so you may start setting up your profile and adding projects.<br/> <strong>Visit the link to start adding your project</strong>',
    linkText: 'Go to Platform'
};
exports.notifyAccountVerified = {
    subject: 'New Account Verification ',
    heading: 'Update On Account Verifcation',
    detail: 'A new user recently verified their account<br><strong>Visit the admin dashboard for follow-up</strong>',
    linkText: 'Go to Admin Dashboard'
};
////////////////////////// ------Project Related ------/////////////////////////////////
exports.notifyProjectCreated = {
    subject: 'New Project Added',
    heading: 'Project Creation Update',
    detail: 'A new project has been added by a user<br><strong>Visit the admin dashboard for follow-up</strong>',
    linkText: 'Go to Admin Dashboard'
};
const notifyProjectDeleted = (userEmail, projectName, projectId) => {
    return {
        subject: 'Project Deleted',
        heading: 'Project Deletion Update',
        detail: `The project named: ${projectName} with id:<strong>${projectId}</strong> has been deleted by ${userEmail}<br><strong>Visit the admin dashboard for follow-up</strong>`,
        linkText: 'Go to Admin Dashboard'
    };
};
exports.notifyProjectDeleted = notifyProjectDeleted;
const notifyProjectPlanUpgraded = (userName, projectName, projectId, newPlan) => {
    return {
        subject: 'Project Plan Upgrade',
        heading: 'Your Project Plan Updates',
        detail: `Dear ${userName}<br/><br/> Your project named: ${projectName} with id:<strong>${projectId}</strong> has been upgraded to ${newPlan}<br><strong>Visit your dashboard to confirm, thanks!</strong>`,
        linkText: 'Visit Dashboard'
    };
};
exports.notifyProjectPlanUpgraded = notifyProjectPlanUpgraded;
const notifyProjectStatusChange = (userName, projectName, projectId, newStatus) => {
    return {
        subject: 'Project Status',
        heading: 'Your Project Status Updates',
        detail: `Dear ${userName}<br/><br/> Your project named: ${projectName} with id:<strong>${projectId}</strong> has been marked as ${newStatus}<br><strong>Visit your dashboard to confirm, thanks!</strong>`,
        linkText: 'Visit Dashboard'
    };
};
exports.notifyProjectStatusChange = notifyProjectStatusChange;
const notifyProjectActivated = (userName, projectName, projectId) => {
    return {
        subject: 'Project Active State Changed',
        heading: 'Project Is Active',
        detail: `Dear ${userName}<br/><br/> Your project named: ${projectName} with id:<strong>${projectId}</strong> has been activated. You will start recieving project reports<br><strong>Visit your dashboard to confirm, thanks!</strong>`,
        linkText: 'Go To Dashboard'
    };
};
exports.notifyProjectActivated = notifyProjectActivated;
const notifyProjectDeactivated = (userName, projectName, projectId) => {
    return {
        subject: 'Project Active State Changed',
        heading: 'Project Is Not Active',
        detail: `Dear ${userName}<br/><br/> Your project named: ${projectName} with id:<strong>${projectId}</strong> has been deactivated. You will not longer be recieving project reports.<br><strong>Contact the support team to sort out the issue</strong>`,
        linkText: 'Contact Support'
    };
};
exports.notifyProjectDeactivated = notifyProjectDeactivated;
////////////////////////// ------Report Related ------/////////////////////////////////
const notifyReportDisptached = (userName, projectName, projectId) => {
    return {
        subject: 'Project Report Update',
        heading: ' This Project\'s Latest Report Is Ready',
        detail: `Dear ${userName}<br/><br/> There is a new report for your project named: ${projectName} <br/>Id:<strong>${projectId}</strong>.<br/>As per your project plan or in respond to an on-demand report, a new report has been created and upload to your dashboard. <strong>Click on the button below to go to your dahsboard</strong>.<br>`,
        linkText: 'Visit Dashboard'
    };
};
exports.notifyReportDisptached = notifyReportDisptached;
////////////////////////// ------Contact Related ------/////////////////////////////////
exports.notifyNewContactMessage = {
    subject: 'New Contact Message Alert',
    heading: 'Contact Message Updates',
    detail: `Dear Admin<br/><br/> A new contact message has been sent by a potential user.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
    linkText: 'Go To Contact List'
};
////////////////////////// ------Project Request Related ------/////////////////////////////////
const notifyNewProjectRequest = (userName, projectName, projectId) => {
    return {
        subject: 'Project Request Updates',
        heading: 'New Project Request',
        detail: `Dear Admin<br/><br/>A new request has been made<br/>By: <strong>${userName}</strong><br/>For project named: <strong>${projectName}</strong><br/> ID: <strong>${projectId}</strong>.<br/><strong>Please visit the dashboard to follow that up</strong>.`,
        linkText: 'Follow Up Now'
    };
};
exports.notifyNewProjectRequest = notifyNewProjectRequest;
const notifyProjectRequestStatusChanged = (userName, projectName, projectId, newStatus) => {
    return {
        subject: 'Project Request Updates',
        heading: 'New Project Request',
        detail: `Dear ${userName}<br/><br/>Your request with regards to the project named: <strong>${projectName}</strong>, ID: <strong>${projectId}</strong> ${newStatus === 'IN_PROGRESS' ? 'is in progress' : 'has been processed'}.<br/><strong>Please visit the dashboard to confirm, thanks!</strong>.`,
        linkText: 'Continue to Dashboard'
    };
};
exports.notifyProjectRequestStatusChanged = notifyProjectRequestStatusChanged;
////////////////////////// ------Testimonials Related ------/////////////////////////////////
const notifyNewtestimonialAdded = () => {
    return {
        subject: 'Testimonials Update',
        heading: 'Latest on Testimonials',
        detail: 'Dear Admin<br/><br/>A new testimonial has been added. <strong>Please visit the dashboard to confirm</strong>',
        linkText: 'Visit Dashboard Now'
    };
};
exports.notifyNewtestimonialAdded = notifyNewtestimonialAdded;
//# sourceMappingURL=email-template.js.map