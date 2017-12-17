var express = require('express');
var path = require('path');
var app = express();
var server = app.listen(8080, function() {
	console.log('Node server is running...');
});
var bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var myFunctions = require('./public/js/myFunctions');
var fs = require('fs');
var url = require('url');  
var pug = require('pug');

const emptyNameMessage = 'Empty name is invalid.';
const emptyEmailMessage = 'Empty e-mail is invalid.';
const emailInvalidMessage = 'E-mail is invalid.';
const emptyPhoneMessage = 'Empty phone is invalid.';
const phoneValidMessage = 'Phone number must be 10 digits not started with 0 and 1.';
const contactAlreadyExists = 'Contact already exists.';
const fileBase = 'contact-base.txt';
const fileCounter = 'counter.txt';
const separator = '$#$#$';

app.set('view engine', 'pug');
app.set('views', './views');

// static files
app.use(express.static(path.join(__dirname, 'public')));
// parser
app.use(bodyParser.urlencoded({ extended: false }));
// validator
app.use(expressValidator());

app.get('/', function (req, res) {
	var contactList = readContactList();
	req.body.contactList = contactList;
    res.render('index', req.body);
});
app.get('/index', function (req, res) {
	var contactList = readContactList();
	req.body.contactList = contactList;
    res.render('index', req.body);
});
app.post('/index', function (req, res) {
	var contactList = readContactList();
	req.body.contactList = contactList;
    res.render('index', req.body);
});
app.get('/contact', function (req, res) {
    res.render('contact', req.body);
});
app.post('/contact', function (req, res) {
    res.render('contact', req.body);
});
app.post('/delete', function (req, res) {
	var contactInfo = req.body.name + separator + req.body.email + separator + req.body.phone;
	console.log('del contactInfo: '+contactInfo);
	var contactFound = findContact(req.body.hash, contactInfo);
	updateContact(contactFound, '');
	var contactList = readContactList();
	req.body.contactList = contactList;
    res.render('index', req.body);
});
app.post('/detail', function (req, res) {
	res.render('detail', req.body);
});
app.post('/create-contact', function (req, res) {
	req.body = myFunctions.clearErrorMessages(['emptyName'], req.body);
	req.checkBody('name', emptyNameMessage).notEmpty();
	req.checkBody('email', emptyEmailMessage).notEmpty();
	req.checkBody('email', emailInvalidMessage).isEmail();
	req.checkBody('phone', emptyPhoneMessage).notEmpty();
	req.checkBody('phone', phoneValidMessage).isInt({ min: 2000000000, max: 9999999999});
	
	var errors = req.validationErrors();
	if (errors) {
		var totalArray = req.body;
		totalArray = myFunctions.addMessage('emptyName', emptyNameMessage, errors, totalArray);
		totalArray = myFunctions.addMessage('emptyEmail', emptyEmailMessage, errors, totalArray);
		totalArray = myFunctions.addMessage('emailInvalid', emailInvalidMessage, errors, totalArray);
		totalArray = myFunctions.addMessage('emptyPhone', emptyPhoneMessage, errors, totalArray);
		totalArray = myFunctions.addMessage('phoneValid', phoneValidMessage, errors, totalArray);
		res.render('contact', totalArray);
	} else {
		var contactInfo = req.body.name + separator + req.body.email + separator + req.body.phone;
		var contactFound = findContact(req.body.hash, contactInfo);
		if ('' == req.body.hash) {
			// create contact
			if ('' != contactFound) {
				// contact already exists
				var totalArray = req.body;
				totalArray['contactExists'] = contactAlreadyExists;
				res.render('contact', totalArray);
			} else {
				contactFound = contactInfo + '\r\n';
				req.body.hash = new String(contactInfo).hashCode();
				contactFound = req.body.hash + separator + contactFound;
				fs.appendFileSync(fileBase, contactFound);
			}
		} else {
			// edit contact
			// verify if exists another contact with new contact info
			var anotherContact = findContact('', contactInfo);
			if ('' != anotherContact) {
				// contact already exists
				var totalArray = req.body;
				totalArray['contactExists'] = contactAlreadyExists;
				res.render('contact', totalArray);
			} else {
				updateContact(contactFound, req.body.hash + separator + contactInfo);
			}
		}	
		res.render('detail', req.body);
	}
});
var updateContact = function(contactFound, contactInfo) {
	var fileContent = fs.readFileSync(fileBase);
	if ('' == contactInfo) {
		// delete all line inclusive break row
		contactFound = contactFound + '\r\n';
	}
	var buffer = (''+fileContent).replace(contactFound, contactInfo);
	fs.writeFileSync(fileBase, buffer);
}
var findContact = function(hash, contactToFind) {
	var contactFound = '';
	if (fs.existsSync(fileBase)) {
		var fileContent = fs.readFileSync(fileBase);
		var contactArray = (''+fileContent).split('\r\n');
		for (i=0;i<contactArray.length;i++){
			// hash + separator + name + separator + email + separator + phone
			var contactInfo = contactArray[i].split(separator);
			if ('' == hash) {
				// look for contact
				if (contactToFind == contactInfo[1] + separator + contactInfo[2] + separator + contactInfo[3]) {
					contactFound = contactArray[i];
					break;
				}
			} else {
				// look for hash
				if (hash == contactInfo[0]) {
					contactFound = contactArray[i];
					break;
				}
			}
		};
	}
	return contactFound;
}
var readContactList = function() {
	var mapContact = [];
	if (fs.existsSync(fileBase)) {
		var fileContent = fs.readFileSync(fileBase);
		var contactArray = (''+fileContent).split('\r\n');
		for (i=0;i<contactArray.length-1;i++){
			// hash + separator + name + separator + email + separator + phone
			var contactInfo = contactArray[i].split(separator);
			mapContact[i] = {
				hash: contactInfo[0],
				name: contactInfo[1],
				email: contactInfo[2],
				phone: contactInfo[3]
			};
		}
	}
	console.log(mapContact);
	return mapContact;
}
String.prototype.hashCode = function(){
	var counter = parseInt(fs.readFileSync(fileCounter));
	console.log('counter: ' + counter);
	var nextCounter = counter + 1;
	fs.writeFileSync(fileCounter, nextCounter);
    return counter;
}