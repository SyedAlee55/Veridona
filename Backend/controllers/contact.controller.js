const nodemailer = require('nodemailer');

exports.sendContactEmail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Configure the transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can change this to suit your email provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Setup email data
        const mailOptions = {
            from: `"${name}" <${email}>`, // sender address
            to: process.env.EMAIL_USER, // list of receivers (typically sending to yourself/support)
            replyTo: email,
            subject: `Contact Form: ${subject}`, // Subject line
            text: `You have received a new message from the Veridona Contact Form.\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`, // plain text body
            html: `
                <h3>New Contact Message</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            ` // html body
        };

        // Send mail
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
};
