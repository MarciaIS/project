exports.addMessage = function(messageKey, messageError, errors, totalArray) {
	var errorFound = false;
	errors.forEach(function(item) {
		if (messageError == item.msg) {
			errorFound = true;
		}
	});
	if(errorFound){
		totalArray[messageKey] = messageError;
	}
	return totalArray;
}
exports.clearErrorMessages = function(messageKeyArray, totalArray) {
	messageKeyArray.forEach(function(keyRemove) {
		if (''!= totalArray[keyRemove]) {
			delete totalArray[keyRemove];
		}
	});
	return totalArray;
}