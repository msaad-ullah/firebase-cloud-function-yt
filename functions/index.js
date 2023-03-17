const functions = require("firebase-functions");
const admin = require('firebase-admin')

admin.initializeApp()

exports.deleteUnverifiedUsers = functions.pubsub.schedule('* * * * *').onRun(async context => {
    let unverifiedUsers = []

    const getAllUsers = async (nextPageToken) => {
        let result = await admin.auth().listUsers(1000, nextPageToken)

        result.users.forEach(user => {
            let now = Date.now()
            let createdAt = Date.parse(user.metadata.creationTime)
            console.log(user.metadata.creationTime)
            let milliseconds = 1 * 60 * 60 * 1000

            if(user.emailVerified === false && now - createdAt > milliseconds) unverifiedUsers.push(user.uid)

            if(result.pageToken) getAllUsers(result.pageToken)
        })
    }

    await getAllUsers()

    let deleteResult = await admin.auth().deleteUsers(unverifiedUsers)

    console.log(deleteResult.successCount)
    console.log(deleteResult.failureCount)
    console.log(deleteResult.errors)
})
