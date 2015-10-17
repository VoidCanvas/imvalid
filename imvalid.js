/*
	
*/

var ValidationModel = (function () {
	
	var defaultIsvalid = false; //this is the default value of isValid. Before calling the .validate() function

	//core ValidationModel constructor
	var ValidationModel = function () {
		this.isValid = false;
	};

	//validation error constructor.
	var ValidationError = function (controlName, msg, code) {
		if(!controlName)
			controlName="";

		if(!msg)
			throw new Error("Validation model: error message not passed");

		this.code=code;
		this.msg=msg.replace(/@controlName/g,controlName);
	};

	//default validation rules are set here 
	var coreValidationRules = {
		____custom____:function (obj, property, controlName, func) {
			var errorObj = func(obj, property);
			var errors = [];
			
			if(errorObj){
				if(Array.isArray(errorObj)){
					errorObj.forEach(function (obj) {
						errors.push(new ValidationError(controlName, obj.msg, obj.code));
					});
				}
				else
					errors.push(new ValidationError(controlName, errorObj.msg, errorObj.code));
			}
			return errors;
		},
		required:function (property, controlName, rule) {
			var code = 10000;
			var msg = rule["msg"] || "@controlName is required";

			if(!property || !property.toString().trim()) //if nothing is inserted
				return new ValidationError(controlName, msg, code);
			
			return null;
		},
		number:function (property, controlName, rule) {
			var code = 11000;
			var msg = rule["msg"] || "@controlName must be a number";

			if(!property)
				return;

			if(typeof property != "number")
				return new ValidationError(controlName, msg, code);

			if(rule.min && rule.max){
				var rangeCode=11003;
				var rangeMsg = rule.rangeMsg || "@controlName should be in between "+rule.min+" & "+rule.max;
				if(property>rule.max || property<rule.min)
					return new ValidationError(controlName, rangeMsg, rangeCode);					
			}
			else{
				if(rule.min){
					var minCode=11001;
					var minMsg = rule.minMsg || "@controlName should be greater than "+rule.min;
					if(property < rule.min)
						return new ValidationError(controlName, minMsg, minCode);					
				}
				if(rule.max){
					var maxCode=11002;
					var maxMsg = rule.maxMsg || "@controlName should be lesser than "+rule.max;
					if(property > rule.max)
						return new ValidationError(controlName, maxMsg, maxCode);					
				}
			}

			return null;
		},
		string:function (property, controlName, rule) {
			var code = 12000;
			var msg = rule["msg"] || "@controlName must be a string value";

			if(!property)
				return;

			if(typeof property != "string")
				return new ValidationError(controlName, msg, code);
			
			if(rule.min && rule.max){
				var rangeCode=12003;
				var rangeMsg = rule.rangeMsg || "@controlName's length should be in between "+rule.min+" & "+rule.max;
				if(property.length>rule.max || property.length<rule.min)
					return new ValidationError(controlName, rangeMsg, rangeCode);					
			}
			else{
				if(rule.min){
					var minCode=12001;
					var minMsg = rule.minMsg || "@controlName's length should be greater than "+rule.min;
					if(property.length < rule.min)
						return new ValidationError(controlName, minMsg, minCode);					
				}
				if(rule.max){
					var maxCode=12002;
					var maxMsg = rule.maxMsg || "@controlName's length should be lesser than "+rule.max;
					if(property.length > rule.max)
						return new ValidationError(controlName, maxMsg, maxCode);					
				}
			}


			return null;
		},
		email:function (property, controlName, rule) {
			if(!property)
				return;
			
			var code = 13000;
			var msg = rule["msg"] || "@controlName is invalid";

			var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    		if(!re.test(property))
				return new ValidationError(controlName, msg, code);
			
			return null;
		},
	};

	//to clear errors
	ValidationModel.prototype.clearErrors = function() {
		this.validationErrors = []; //clear the validation errors
		this.isValid=defaultIsvalid;
	};

	//the validate function validates all properties and set the value of isValid
	ValidationModel.prototype.validate = function() {
		this.clearErrors();
		var validations = helper.getValidationRules(this); //to get proper validation rules set
		for(var validation in validations){
			if(validations.hasOwnProperty(validation)){
				var rulesObj = validations[validation];
				var property = this[validation];
				var errorList = helper.validateRules(this,property,rulesObj); //this function will validate and assign all errors to the validationErrors				
			}
		}
		if(!this.validationErrors.length)
			this.isValid=true;

		return this.isValid;
	};

	//helper
	var helper={
		//to merge two objects and create the 3rd one
		merge:function (obj1,obj2){
		    var obj3 = {};
		    for (var attrname in obj1) {
		    	if(obj1.hasOwnProperty(attrname))
			    	obj3[attrname] = obj1[attrname]; 
		 	}
		    for (var attrname in obj2) { 
		    	if(obj2.hasOwnProperty(attrname))
		    		obj3[attrname] = obj2[attrname]; 
		    }
		    return obj3;
		},

		getValidationRules:function (obj) {
			var rulesSet = {};
			if(obj){
				var currentValidations = obj.validations || {};
				rulesSet = this.merge(this.getValidationRules(obj.__proto__), currentValidations)			
			}
			return rulesSet;
		},

		validateRules:function (obj, property, rulesObj) {
			var errorList = [];
			if(rulesObj){
				var validationRules = rulesObj.rules;
				if(validationRules && validationRules.length){
					validationRules.forEach(function (rule,i) {
						if(rulesObj[rule.ruleName]){
							var errors = coreValidationRules.____custom____(obj,property,rulesObj.controlName,rulesObj[rule.ruleName]);
							if(errors.length)
								obj.validationErrors = obj.validationErrors.concat(errors);
						}
						else
							if(coreValidationRules[rule.ruleName]){
								var error = coreValidationRules[rule.ruleName](property,rule.controlName || rulesObj.controlName,rule);
								if(error)
									obj.validationErrors.push(error);
							}
					});
				}
			}
			return errorList;
		}
	}

	return ValidationModel;
})();
