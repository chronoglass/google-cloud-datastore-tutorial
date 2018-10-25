//var fs = require('fs'); // using FS to read json keyfile
/* CONFIGURATION */
var config = {
	gcpProjectId: '<prodid>',
	gcpPubSubSubscriptionName: '<SubName>',
	gcpServiceAccountKeyFilePath: '<where yo key>',
}
_checkConfig();


var Datastore = require('@google-cloud/datastore');
var Pubsub = require('@google-cloud/pubsub');

var datastore = new Datastore({
	projectId: config.gcpProjectId,
	keyFilename: config.gcpServiceAccountKeyFilePath
});

var pubsub = new Pubsub({
	  projectId: config.gcpProjectId,
	  keyFilename: config.gcpServiceAccountKeyFilePath,
	});

var subscription = pubsub.subscription(config.gcpPubSubSubscriptionName);
console.log(subscription);

function storeEvent(message) {
    var key = datastore.key('ParticleEvent');

    datastore.save({
        key: key,
        data: _createEventObjectForStorage(message)
    }, function(err) {
		if(err) {
			console.log('There was an error storing the event', err);
		}
		console.log('Particle event stored in Datastore!\r\n', _createEventObjectForStorage(message, true))
    });

};

subscription.on('message', function(message) {
	console.log('Particle event received from Pub/Sub!\r\n', _createEventObjectForStorage(message, true));
	// Called every time a message is received.
	// message.id = ID used to acknowledge its receival.
	// message.data = Contents of the message.
	// message.attributes = Attributes of the message.
	storeEvent(message);
	message.ack();
});

function _checkConfig() {
	if(config.gcpProjectId === ''  || !config.gcpProjectId) {
		console.log('You must set your Google Cloud Platform project ID in tutorial.js');
		process.exit(1);
	}
	if(config.gcpPubSubSubscriptionName === '' || !config.gcpPubSubSubscriptionName) {
		console.log('You must set your Google Cloud Pub/Sub subscription name in tutorial.js');
		process.exit(1);
	}
};

function _createEventObjectForStorage(message, log) {
	var obj = {
		gc_pub_sub_id: message.id,
		device_id: message.attributes.device_id,
		event: message.attributes.event,
		data: message.data,
		published_at: message.attributes.published_at
	}

	if(log) {
		return util.inspect(obj);
	} else {
		return obj;
	}
};


