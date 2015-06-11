/*
	#How to use:
	
	var myModel = function(){
		ValidationModel.apply(this,arguments);
		this.name = null;
		this.age = null;
		this.email = null;
	};
	myModel.prototype.validations={
		name:{
			rules: ['required'], //will give the default msg
			controlName: "full name"
		},
		age:{
			rules: ['required','number'],
			messages: ["@controlName is mandatory", "@controlName must be a number"],
			controlName: "age"
		},
		email: {
			rules: ['email','custom'],
			messages: ["@controlName is invalid"," "],
			controlName: "email address",
			custom: function(obj){
				//do your stuff
				return {
					code: 121,
					msg: "@controlName is taken already"
				}
			}
		}
	}
*/


var ValidationModel = function () {
	// body...
}

var ValidationError = function (controlName, msg, code) {
	if(!controlName)
		throw new Error("Validation model: controlName is not passed");
	if(!msg)
		throw new Error("Validation model: error message not passed");

	this.code=code;
	this.msg=msg.replace(/@controlName/g,controlName);
}

ValidationModel.prototype.validationRules = Object.freeze({
	required:function (property, controlName, msg) {
		if(!property || !property.toString().trim()){ //if nothing is inserted
			var code = 100;
			if(!msg)
				msg = "@controlName is required"
			var error = new ValidationError(controlName, msg, code)
			this.validationErrors.push(error);
		}
	}  
});

ValidationModel.prototype.validate = function() {
	this.validationErrors = [];
	this.isValid=true;
	var validations = this.validations;
	for(var validation in validations){
		if(validations.hasOwnProperty(validation)){
			var rulesObj = validations[validation];
			var property = this[validation];
			rulesObj.rules.forEach(function (rule, i) {
				if(this.validationRules[validation]){
					this.validationRules[validation](property, rulesObj.controlName,rulesObj.messages[i]);	
				}
				else
					if(rulesObj[validation]){
						var errObj = rulesObj[validation](this);
						if(errObj){
							var error = new ValidationError(rulesObj.controlName, (errObj.msg || rulesObj.messages[i]), errObj.code);
							this.validationErrors.push(error);
						}
					}

			}.bind(this))
		}
	}
	if(this.validationErrors.length)
		this.isValid=false;

	return this.isValid;
};


module.exports = ValidationModel;