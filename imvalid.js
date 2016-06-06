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
			if(errorObj){
				var error = new ValidationError(controlName, errorObj.msg, errorObj.code);
				return error;
			}
			return null;
		},
		required:function (property, controlName, msg) {
			var code = 100;
			if(!msg)
				msg = "@controlName is required";

			if(!property || !property.toString().trim()) //if nothing is inserted
				return new ValidationError(controlName, msg, code);
			
			return null;
		},
		number:function (property, controlName, msg) {
			var code = 101;
			if(!msg)
				msg = "@controlName must be a number";

			if(property)
				if(typeof property != "number")
					return new ValidationError(controlName, msg, code);

			return null;
		}
	};

	//to clear errors
	ValidationModel.prototype.clearErrors = function() {
		this.validationErrors = []; //clear the validation errors
		this.isValid=defaultIsvalid;
	};

	//the validate function validates all properties and set the value of isValid
	ValidationModel.prototype.validate = function() {
		this.clearErrors();
		this.hasChildErrors = false;
		var validations = helper.getValidationRules(this); //to get proper validation rules set
		for(var validation in validations){
			if(validations.hasOwnProperty(validation)){
				var rulesObj = validations[validation];
				var property = this[validation];
				var errorList = helper.validateRules(this,property,rulesObj); //this function will validate and assign all errors to the validationErrors				
			}
		}
		if(!this.validationErrors.length && !this.hasChildErrors)
			this.isValid=true;
	
		delete(this.hasChildErrors);

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
						if(rulesObj[rule]){
							var error = coreValidationRules.____custom____(obj,property,rulesObj.controlName, (rulesObj[rule] || obj[rule]));
							if(error)
								obj.validationErrors.push(error);
						}
						else
							if(coreValidationRules[rule]){
								var msg = rulesObj["messages"] && rulesObj["messages"][i] 
								var error = coreValidationRules[rule](property,rulesObj.controlName,msg);
								if(error)
									obj.validationErrors.push(error);
							}
					});
				}
			}
			if(property && property instanceof ValidationModel){
				obj.hasChildErrors = obj.hasChildErrors || !property.validate();
				//obj.validationErrors = obj.validationErrors.concat(property.validationErrors);
			}
			if(property && Array.isArray(property)){
				property.forEach(function (propertyObject) {
					if(propertyObject instanceof ValidationModel){
						obj.hasChildErrors = obj.hasChildErrors || !propertyObject.validate();
					}
				})
			}
			return errorList;
		}
	}

	return ValidationModel;
})();
