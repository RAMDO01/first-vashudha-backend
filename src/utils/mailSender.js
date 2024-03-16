import nodemailer from "nodemailer"
import { ApiError } from "./ApiError.js"

const mailSender = async (email, title, body) => {

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    })

    try {
        const info = await transporter.sendMail({
            from: 'VASHUDHA KALYAN', 
            to: `${email}`, // list of receivers
            text: `${title}`, // plain text body
            html: `${body}`, // html body
        })

        console.log("this is mail info => ",info)
        return info;
    } catch (error) {
        console.log("ERROR: error in mail sending",error)
        throw new ApiError(500, "error in mail sending uitls")
    }
}

export {mailSender}