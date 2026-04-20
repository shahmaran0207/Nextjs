import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (to: string, code: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    })

    await transporter.sendMail({
        from: `"My Service <${process.env.MAIL_USER}>`,
        to,
        subject: "이메일 인증코드",
        html: `<h2>인증코드: ${code}</h2><p>5분 내로 입력해주세요</p>`,
    })
}