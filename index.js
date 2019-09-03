const line = require('@line/bot-sdk');
const express = require('express');
const serverless = require('serverless-http');
require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
	databaseURL: 'https://fish-selling-app.firebaseio.com',
	projectId: 'fish-selling-app'
});

const db = admin.firestore();

const config = {
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
	channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

let observer = db.collection('orders').onSnapshot(querySnapshot => {
	let orderInfo;
	querySnapshot.docChanges().forEach(change => {
		if (change.type === 'added') {
			console.log('New order: ', change.doc.data());
			orderInfo = { type: 'New Order', data: change.doc.data() };
		}
		if (change.type === 'modified') {
			console.log('Modified order: ', change.doc.data());
			orderInfo = { type: 'Modified Order', data: change.doc.data() };
		}
		if (change.type === 'removed') {
			console.log('Removed order: ', change.doc.data());
			orderInfo = { type: 'Removed Order', data: change.doc.data() };
		}
		// Send push msg to Allen
		client
			.pushMessage('Ubd6d3afcb7c1f5fe7a42793f8180427a', {
				type: 'text',
				text: JSON.stringify(orderInfo)
			})
			.then(res => {
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			});
		// To me
		client
			.pushMessage('U2047b86d40d88cf8814ad5e0cb5fed27', {
				type: 'text',
				text: JSON.stringify(orderInfo, null, 2)
			})
			.then(res => {
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			});
	});
});

// How does this work when it's hosted?
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
// 	console.log(`Server listening on ${port}`);
// });

// module.exports.handler = serverless(app);

// register a webhook handler with middleware
// about the middleware, please refer to doc
// app.post('/', line.middleware(config), (req, res) => {
// 	console.log(req.body.events);
// 	// Promise.all(req.body.events.map(handleEvent))
// 	// 	.then(result => res.json(result))
// 	// 	.catch(err => {
// 	// 		console.error(err);
// 	// 		res.status(500).end();
// 	// 	});

// 	// Send push msg
// 	// client
// 	// 	.pushMessage('Ubd6d3afcb7c1f5fe7a42793f8180427a', {
// 	// 		type: 'text',
// 	// 		text: 'Hello World!'
// 	// 	})
// 	// 	.then(res => console.log(res))
// 	// 	.catch(err => {
// 	// 		console.log(err);
// 	// 	});
// 	res.json({msg: 'All good'})
// });

// function handleEvent(event) {
// 	if (event.type !== 'message' || event.message.type !== 'text') {
// 		// ignore non-text-message event
// 		return Promise.resolve(null);
// 	}

// 	// create a echoing text message
// 	const echo = { type: 'text', text: event.message.text };

// 	// use reply API
// 	return client.replyMessage(event.replyToken, echo);
// }
