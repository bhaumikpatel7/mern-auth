import nodemailer from 'nodemailer';



const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user:"33bdbe4114bbb6", // fix:  undefiend 
    pass:"c6130b7eeaaad1",// fix:  undefiend 
  }
  
});


export default transport;