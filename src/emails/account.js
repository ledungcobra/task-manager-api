const mailjet = require ('node-mailjet')
.connect(process.env.SEND_MAIL_API_KEY,process.env.SOMETHING)
const sendMail = (From,FromName,To,ToName,Subject,Content)=>{
   return mailjet
    .post("send", {'version': 'v3.1'})
    .request({
    "Messages":[
        {
        "From": {
            "Email": From,
            "Name": FromName
        },
        "To": [
            {
            "Email": To,
            "Name": ToName
            }
        ],
        "Subject": Subject,
        "HTMLPart": "<h3>"+Content+"</h3><br/>May the delivery force be with you!",
        "CustomID": "AppGettingStartedTest"
        }
    ]
    })
}

sendMail('ledungcobra@gmail.com','DungLe','truongsalacuavietnam@gmail.com','DUngXX','None','Hello world')
  .then((result) => {
    console.log(result.body)
  })
  .catch((err) => {
    console.log(err.statusCode)
  })