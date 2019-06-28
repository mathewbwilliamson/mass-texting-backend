const phone  = require('phone')
const express = require('express')
const router = express.Router()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
console.log('[matt] accountSid', accountSid)


const client = require('twilio')(accountSid, authToken);

router.post('/', (req, res, next) => {
    console.log('[matt] req', req.body)
    
    // Remember that we can't send a message to a phone number that is not verified when on a trial account
    const { message, toPhoneNumbers = ['+19415876572'], fromPhoneNumber = process.env.OUR_PHONE_NUMBER } = req.body
    
    const cleanedFromPhoneNumber = phone(fromPhoneNumber, 'USA')
    
    toPhoneNumbers.forEach(toPhoneNumber => {
        const cleanedToPhoneNumber = phone(toPhoneNumber, 'USA')

        if (cleanedToPhoneNumber.length === 0) {
            const err = new Error('Phone number is invalid')
            err.statusCode = 405
            next(err)
            return err
        }
    
        client.messages
            .create({
                body: message,
                from: process.env.OUR_PHONE_NUMBER,
                to: cleanedToPhoneNumber[0]
            })
            .then(message => res.json(`The ${message.sid} was sent`))
            .catch(err => next(err))
    })
})

module.exports = router
