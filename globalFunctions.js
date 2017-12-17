var editContact = function(actionUser, action, hash, name, email, phone) {
	document.forms[0].elements.actionUser.value = actionUser;
	document.forms[0].action='/'+action;
	if (hash != undefined) {
		document.forms[0].elements.hash.value = hash;
		document.forms[0].elements.name.value = name;
		document.forms[0].elements.email.value = email;
		document.forms[0].elements.phone.value = phone;
	}
	if (actionUser == 'delete') {
		if (confirm('Are you sure?')) {
			document.forms[0].submit();
		}
	} else {
		document.forms[0].submit();	
	}
}